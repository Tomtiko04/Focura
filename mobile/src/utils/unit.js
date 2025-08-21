import { Platform } from "react-native";

/**
 * Adds "px" only when running on web.
 * @param {number|string} value - Numeric value or already unit-ed string
 */
export const unit = (value) => {
	if (typeof value === "string") return value; // already has unit
	return Platform.OS === "web" ? `${value}px` : value;
};
