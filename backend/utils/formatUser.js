export const formatUser = (user) => {
    if (!user) return null;
    const formatted = { ...user };
    formatted._id = user.id; // Map id to _id for frontend compatibility
    
    // Parse history if it is serialized as a string JSON array
    if (typeof user.history === 'string') {
        try {
            formatted.history = JSON.parse(user.history);
        } catch {
            formatted.history = [];
        }
    }
    return formatted;
};
