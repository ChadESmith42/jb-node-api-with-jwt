/**
 * Filter sensitive password property from object model.
 * @param {object} objectModel Object that contains password property.
 * @returns {object} Altered object model without password property.
 */
const filterPassword = (objectModel) => {
  const { password, ...filteredObject } = objectModel;
  return filteredObject;
};

module.exports = filterPassword;
