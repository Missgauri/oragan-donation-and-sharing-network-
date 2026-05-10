/**
 * Pure utility — filters an organ list by search term, blood type, and organ type.
 * Keeping this outside the component makes it independently testable.
 *
 * @param {Array}  organs          - Full list of organ objects
 * @param {string} searchTerm      - Free-text search (matches organ name or location)
 * @param {string} bloodTypeFilter - Blood type string or 'All'
 * @param {string} organFilter     - Organ name string or 'All'
 * @returns {Array} Filtered organ list
 */
export function filterOrgans(organs, searchTerm, bloodTypeFilter, organFilter) {
  return organs.filter((item) => {
    const matchSearch =
      item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.organ.toLowerCase().includes(searchTerm.toLowerCase());
    const matchBlood  = bloodTypeFilter === 'All' || item.bloodType === bloodTypeFilter;
    const matchOrgan  = organFilter     === 'All' || item.organ      === organFilter;
    return matchSearch && matchBlood && matchOrgan;
  });
}
