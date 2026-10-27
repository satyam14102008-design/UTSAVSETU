from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from enum import Enum

class TransactionStatus(str, Enum):
    PLANNED = "planned"
    PAID = "paid"
    PARTIAL = "partial"
    PENDING = "pending"

class BudgetCategoryCreate(BaseModel):
    event_id: str
    name: str = Field(..., min_length=2, max_length=100)
    allocated_amount: float = Field(default=0.0, ge=0)
    icon: Optional[str] = "tag"
    notes: Optional[str] = None

class BudgetCategoryResponse(BaseModel):
    id: str
    event_id: str
    name: str
    allocated_amount: float
    spent_amount: float = 0.0
    remaining_amount: float = 0.0
    icon: Optional[str] = "tag"
    notes: Optional[str] = None

class BudgetTransactionCreate(BaseModel):
    event_id: str
    category_id: str
    title: str = Field(..., min_length=2, max_length=150)
    amount: float = Field(..., ge=0)
    vendor_name: Optional[str] = None
    vendor_phone: Optional[str] = None
    status: TransactionStatus = TransactionStatus.PAID
    paid_date: Optional[str] = None
    receipt_notes: Optional[str] = None

class BudgetTransactionResponse(BaseModel):
    id: str
    event_id: str
    category_id: str
    category_name: Optional[str] = None
    title: str
    amount: float
    vendor_name: Optional[str] = None
    vendor_phone: Optional[str] = None
    status: TransactionStatus
    paid_date: Optional[str] = None
    receipt_notes: Optional[str] = None
    created_at: Optional[str] = None

class FoodCateringConfig(BaseModel):
    event_id: str
    price_per_veg: float = Field(default=750.0, ge=0)
    price_per_non_veg: float = Field(default=950.0, ge=0)
    price_per_child: float = Field(default=400.0, ge=0)
    buffer_percentage: float = Field(default=10.0, ge=0, le=50) # e.g. 10%
    catering_minimum_guarantee: int = Field(default=100, ge=0)
    fixed_service_fee: float = Field(default=15000.0, ge=0)
    cake_cost_estimate: Optional[float] = 0.0
    prasad_cost_estimate: Optional[float] = 0.0
    actual_catering_cost: Optional[float] = 0.0
    notes: Optional[str] = None

class FoodBudgetSummary(BaseModel):
    total_invited_guests: int
    confirmed_adults: int
    confirmed_children: int
    confirmed_total_attendees: int
    confirmed_veg_meals: int
    confirmed_non_veg_meals: int
    confirmed_jain_meals: int
    
    # Food preparations with buffer
    recommended_veg_prep: int
    recommended_non_veg_prep: int
    recommended_children_prep: int
    recommended_total_plates: int
    
    # Cost calculations
    original_invite_estimated_cost: float
    response_based_estimated_cost: float
    estimated_potential_saving: float # Clearly labeled as estimated saving
    actual_spent_cost: float
    buffer_percentage_applied: float

