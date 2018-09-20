const SearchResultList = require('../models/SearchResultList');

module.exports = function findUsers({ filters, pagination, userRepository }) {
  return Promise.all([
    userRepository.find(filters, pagination),
    userRepository.count(filters)
  ]).then((values) => {
    return new SearchResultList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalResults: values[1],
      paginatedResults: values[0]
    });
  });
};
