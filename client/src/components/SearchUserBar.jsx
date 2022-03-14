
import React, { useState } from 'react';
import { useLazyQuery } from "@apollo/client";
import { Search } from "semantic-ui-react";
import { SEARCH_USERS_QUERY } from "../utils/graphql";
import { useAuth } from '../context/auth';

function SearchUserBar({ onSelectUser = () => {} }) {

  const [filters, _updateFilter] = useState({ 
    email: '',
    username: '',
  });

  const setFilter = (value) => {
    let t = {
      username: value,
      email: value,
    };
    _updateFilter(t);
    return t;
  };

  const [startFirstSearch, {
    called: firstSearchCalled,
    data: searchData,
    loading: searchLoading,
    error: searchError,
    refetch: searchRefetch,
  }] = useLazyQuery(SEARCH_USERS_QUERY, {
    variables: filters,
  });

  const handleSearchChange = React.useCallback((e, data) => {
    let filters = setFilter(data.value);
    if (!data.value) return;
    if (firstSearchCalled)
      searchRefetch(filters);
    else startFirstSearch(filters);
  }, [filters, searchData]);

  const currentUser = useAuth().user;

  return (
    <Search
      fluid size="large"
      placeholder="Search a user to chat..."
      loading={searchLoading}
      onSearchChange={handleSearchChange}
      results={searchData?.searchUsers?.filter(({id}) => id !== currentUser.id).map((user) => ({
        title: user.username,
        description: user.email,
        user,
      })) ?? []}
      onResultSelect={onSelectUser}
    />
  );
}

export default SearchUserBar;
