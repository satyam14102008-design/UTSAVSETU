import json
import os
import re
import uuid
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional
from backend.app.config import settings

logger = logging.getLogger("utsavsetu.database")

# In-memory document storage with JSON persistence for zero-dependency local demo / fallback
class LocalCollection:
    def __init__(self, name: str, data_dir: str):
        self.name = name
        self.data_dir = data_dir
        self.file_path = os.path.join(data_dir, f"{name}.json")
        self.docs: Dict[str, Dict[str, Any]] = {}
        self._load()

    def _load(self):
        os.makedirs(self.data_dir, exist_ok=True)
        if os.path.exists(self.file_path):
            try:
                with open(self.file_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.docs = {doc.get("id") or doc.get("_id") or str(uuid.uuid4()): doc for doc in data}
            except Exception as e:
                logger.warning(f"Could not load data from {self.file_path}: {e}")
                self.docs = {}

    def _save(self):
        try:
            with open(self.file_path, "w", encoding="utf-8") as f:
                json.dump(list(self.docs.values()), f, default=str, indent=2)
        except Exception as e:
            logger.error(f"Error saving {self.name} to disk: {e}")

    def _matches_filter(self, doc: Dict[str, Any], query: Dict[str, Any]) -> bool:
        if not query:
            return True
        for key, val in query.items():
            if key == "$or":
                if not any(self._matches_filter(doc, subq) for subq in val):
                    return False
                continue

            doc_val = doc.get(key)
            if isinstance(val, dict):
                # Operator query
                for op, op_val in val.items():
                    if op == "$eq" and doc_val != op_val:
                        return False
                    elif op == "$ne" and doc_val == op_val:
                        return False
                    elif op == "$in" and doc_val not in op_val:
                        return False
                    elif op == "$nin" and doc_val in op_val:
                        return False
                    elif op == "$gt" and (doc_val is None or doc_val <= op_val):
                        return False
                    elif op == "$gte" and (doc_val is None or doc_val < op_val):
                        return False
                    elif op == "$lt" and (doc_val is None or doc_val >= op_val):
                        return False
                    elif op == "$lte" and (doc_val is None or doc_val > op_val):
                        return False
                    elif op == "$regex":
                        flags = re.IGNORECASE if val.get("$options") == "i" else 0
                        if not doc_val or not re.search(str(op_val), str(doc_val), flags):
                            return False
            else:
                if doc_val != val:
                    return False
        return True

    def find_one(self, query: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
        query = query or {}
        for doc in self.docs.values():
            if self._matches_filter(doc, query):
                return dict(doc)
        return None

    def find(self, query: Optional[Dict[str, Any]] = None, sort: Optional[List] = None, skip: int = 0, limit: int = 1000) -> List[Dict[str, Any]]:
        query = query or {}
        matches = [dict(doc) for doc in self.docs.values() if self._matches_filter(doc, query)]
        if sort:
            for field, order in reversed(sort):
                matches.sort(key=lambda x: str(x.get(field, "")), reverse=(order == -1))
        if skip:
            matches = matches[skip:]
        if limit:
            matches = matches[:limit]
        return matches

    def insert_one(self, doc: Dict[str, Any]) -> Any:
        doc = dict(doc)
        doc_id = doc.get("id") or doc.get("_id") or str(uuid.uuid4())
        doc["id"] = doc_id
        doc["_id"] = doc_id
        if "created_at" not in doc:
            doc["created_at"] = datetime.utcnow().isoformat()
        if "updated_at" not in doc:
            doc["updated_at"] = datetime.utcnow().isoformat()
        self.docs[doc_id] = doc
        self._save()
        
        class InsertResult:
            inserted_id = doc_id
        return InsertResult()

    def insert_many(self, docs: List[Dict[str, Any]]) -> Any:
        ids = []
        for d in docs:
            res = self.insert_one(d)
            ids.append(res.inserted_id)
        class InsertManyResult:
            inserted_ids = ids
        return InsertManyResult()

    def update_one(self, filter_query: Dict[str, Any], update: Dict[str, Any], upsert: bool = False) -> Any:
        target_doc = None
        target_id = None
        for did, doc in self.docs.items():
            if self._matches_filter(doc, filter_query):
                target_doc = doc
                target_id = did
                break

        if target_doc:
            if "$set" in update:
                for k, v in update["$set"].items():
                    target_doc[k] = v
            if "$inc" in update:
                for k, v in update["$inc"].items():
                    target_doc[k] = target_doc.get(k, 0) + v
            target_doc["updated_at"] = datetime.utcnow().isoformat()
            self.docs[target_id] = target_doc
            self._save()
            class UpdateResult:
                matched_count = 1
                modified_count = 1
            return UpdateResult()
        elif upsert:
            new_doc = dict(filter_query)
            if "$set" in update:
                new_doc.update(update["$set"])
            self.insert_one(new_doc)
            class UpsertResult:
                matched_count = 0
                modified_count = 1
            return UpsertResult()
        
        class NoUpdateResult:
            matched_count = 0
            modified_count = 0
        return NoUpdateResult()

    def delete_one(self, filter_query: Dict[str, Any]) -> Any:
        for did, doc in list(self.docs.items()):
            if self._matches_filter(doc, filter_query):
                del self.docs[did]
                self._save()
                class DelResult:
                    deleted_count = 1
                return DelResult()
        class NoDelResult:
            deleted_count = 0
        return NoDelResult()

    def delete_many(self, filter_query: Dict[str, Any]) -> Any:
        count = 0
        for did, doc in list(self.docs.items()):
            if self._matches_filter(doc, filter_query):
                del self.docs[did]
                count += 1
        if count > 0:
            self._save()
        class DelManyResult:
            deleted_count = count
        return DelManyResult()

    def count_documents(self, query: Optional[Dict[str, Any]] = None) -> int:
        query = query or {}
        return sum(1 for doc in self.docs.values() if self._matches_filter(doc, query))


class LocalDatabase:
    def __init__(self, data_dir: str):
        self.data_dir = data_dir
        self.collections: Dict[str, LocalCollection] = {}

    def get_collection(self, name: str) -> LocalCollection:
        if name not in self.collections:
            self.collections[name] = LocalCollection(name, self.data_dir)
        return self.collections[name]

    def __getitem__(self, name: str) -> LocalCollection:
        return self.get_collection(name)


def sanitize_doc(doc: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    if doc is None or not isinstance(doc, dict):
        return doc
    clean = dict(doc)
    clean.pop("_id", None)
    for k, v in list(clean.items()):
        if v is not None and hasattr(v, "__class__") and "ObjectId" in v.__class__.__name__:
            clean[k] = str(v)
    return clean

class MongoCollectionWrapper:
    def __init__(self, col):
        self.col = col

    def find_one(self, *args, **kwargs):
        res = self.col.find_one(*args, **kwargs)
        return sanitize_doc(res)

    def find(self, *args, **kwargs):
        cursor = self.col.find(*args, **kwargs)
        return [sanitize_doc(d) for d in cursor]

    def insert_one(self, *args, **kwargs):
        return self.col.insert_one(*args, **kwargs)

    def insert_many(self, *args, **kwargs):
        return self.col.insert_many(*args, **kwargs)

    def update_one(self, *args, **kwargs):
        return self.col.update_one(*args, **kwargs)

    def delete_one(self, *args, **kwargs):
        return self.col.delete_one(*args, **kwargs)

    def delete_many(self, *args, **kwargs):
        return self.col.delete_many(*args, **kwargs)

    def count_documents(self, *args, **kwargs):
        return self.col.count_documents(*args, **kwargs)

    def __getattr__(self, name):
        return getattr(self.col, name)


class DatabaseManager:
    _instance = None

    def __init__(self):
        self.is_connected_to_mongo = False
        self.client = None
        self.db = None
        self.mode = "local"
        self._init_connection()

    def _init_connection(self):
        import socket
        import pymongo
        
        # Fast socket check before PyMongo connection attempt
        mongo_available = False
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.settimeout(0.2)
                res = s.connect_ex(("127.0.0.1", 27017))
                if res == 0:
                    mongo_available = True
        except Exception:
            mongo_available = False

        if mongo_available and not os.getenv("FORCE_LOCAL_STORAGE"):
            try:
                client = pymongo.MongoClient(settings.MONGODB_URI, serverSelectionTimeoutMS=1000)
                client.server_info()
                self.client = client
                self.db = client[settings.DB_NAME]
                self.is_connected_to_mongo = True
                self.mode = "mongodb"
                logger.info(f"Connected to production MongoDB at {settings.MONGODB_URI}")
                return
            except Exception as e:
                logger.warning(f"Mongo port was open but handshake failed ({e}). Falling back.")

        # Fallback to local persistent document store
        data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".data")
        self.db = LocalDatabase(data_dir)
        self.is_connected_to_mongo = False
        self.mode = "local_document_store"
        logger.info(f"Using resilient local document storage in {data_dir}")

    def get_collection(self, name: str):
        if self.is_connected_to_mongo:
            return MongoCollectionWrapper(self.db[name])
        return self.db.get_collection(name)

    def get_status(self) -> Dict[str, Any]:
        return {
            "mode": self.mode,
            "connected_to_mongo": self.is_connected_to_mongo,
            "database_name": settings.DB_NAME
        }

db_manager = DatabaseManager()

def get_db():
    return db_manager.db

def get_collection(collection_name: str):
    return db_manager.get_collection(collection_name)
