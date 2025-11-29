/**
 * Get role name from role object or string
 * @param {string|object} role - Role can be a string (name) or object with name property
 * @returns {string} Role name
 */
export const getRoleName = (role) => {
  if (!role) return '';
  if (typeof role === 'string') return role;
  if (typeof role === 'object' && role !== null) {
    return role.name || '';
  }
  return '';
};

/**
 * Get role names from an array of roles
 * @param {Array} roles - Array of role objects or strings
 * @returns {Array<string>} Array of role names
 */
export const getRoleNames = (roles) => {
  if (!roles || !Array.isArray(roles)) return [];
  return roles.map(role => getRoleName(role)).filter(Boolean);
};

/**
 * Format role for display (handles both object and string)
 * @param {string|object} role - Role to format
 * @returns {string} Formatted role name
 */
export const formatRole = (role) => {
  return getRoleName(role);
};

