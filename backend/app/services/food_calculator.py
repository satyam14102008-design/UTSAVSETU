import math
from typing import Dict, Any, List
from backend.app.models.budget import FoodCateringConfig, FoodBudgetSummary

def calculate_food_and_catering(
    config: FoodCateringConfig,
    total_invited_guests: int,
    confirmed_adults: int,
    confirmed_children: int,
    confirmed_veg: int,
    confirmed_non_veg: int,
    confirmed_jain: int,
    actual_spent: float = 0.0
) -> FoodBudgetSummary:
    confirmed_total = confirmed_adults + confirmed_children
    buffer_multiplier = 1.0 + (config.buffer_percentage / 100.0)

    # If guests haven't specified individual meal preference, assume veg or split proportionally
    specified_meals = confirmed_veg + confirmed_non_veg + confirmed_jain
    unspecified_adults = max(0, confirmed_adults - specified_meals)
    effective_veg = confirmed_veg + confirmed_jain + unspecified_adults
    effective_non_veg = confirmed_non_veg

    # Recommended preparation with organizer's buffer percentage
    recommended_veg = math.ceil(round(effective_veg * buffer_multiplier, 4)) if effective_veg > 0 else 0
    recommended_non_veg = math.ceil(round(effective_non_veg * buffer_multiplier, 4)) if effective_non_veg > 0 else 0
    recommended_children = math.ceil(round(confirmed_children * buffer_multiplier, 4)) if confirmed_children > 0 else 0
    
    calc_total_plates = recommended_veg + recommended_non_veg + recommended_children

    # Check minimum guarantee
    if calc_total_plates < config.catering_minimum_guarantee and calc_total_plates > 0:
        shortfall = config.catering_minimum_guarantee - calc_total_plates
        recommended_veg += shortfall
        calc_total_plates = config.catering_minimum_guarantee

    # Response-based cost calculation
    response_food_cost = (
        (recommended_veg * config.price_per_veg) +
        (recommended_non_veg * config.price_per_non_veg) +
        (recommended_children * config.price_per_child) +
        config.fixed_service_fee +
        (config.cake_cost_estimate or 0.0) +
        (config.prasad_cost_estimate or 0.0)
    )

    # Original invitation-based cost (assuming all invited guests attended with 80% veg / 20% non-veg split)
    orig_adults = max(0, total_invited_guests - math.floor(total_invited_guests * 0.15))
    orig_children = total_invited_guests - orig_adults
    orig_veg = math.ceil(orig_adults * 0.75)
    orig_non_veg = orig_adults - orig_veg

    original_estimated_cost = (
        (orig_veg * config.price_per_veg) +
        (orig_non_veg * config.price_per_non_veg) +
        (orig_children * config.price_per_child) +
        config.fixed_service_fee +
        (config.cake_cost_estimate or 0.0) +
        (config.prasad_cost_estimate or 0.0)
    )

    estimated_difference = max(0.0, original_estimated_cost - response_food_cost)

    return FoodBudgetSummary(
        total_invited_guests=total_invited_guests,
        confirmed_adults=confirmed_adults,
        confirmed_children=confirmed_children,
        confirmed_total_attendees=confirmed_total,
        confirmed_veg_meals=confirmed_veg,
        confirmed_non_veg_meals=confirmed_non_veg,
        confirmed_jain_meals=confirmed_jain,
        recommended_veg_prep=recommended_veg,
        recommended_non_veg_prep=recommended_non_veg,
        recommended_children_prep=recommended_children,
        recommended_total_plates=calc_total_plates,
        original_invite_estimated_cost=round(original_estimated_cost, 2),
        response_based_estimated_cost=round(response_food_cost, 2),
        estimated_potential_saving=round(estimated_difference, 2),
        actual_spent_cost=round(actual_spent, 2),
        buffer_percentage_applied=config.buffer_percentage
    )
