/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import React from 'react';
import { mount } from 'enzyme';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import fetchMock from 'fetch-mock';

import ChartList from 'src/views/chartList/ChartList';
import ListView from 'src/components/ListView/ListView';

// store needed for withToasts(ChartTable)
const mockStore = configureStore([thunk]);
const store = mockStore({});

const chartsInfoEndpoint = 'glob:*/api/v1/chart/_info*';
const chartssOwnersEndpoint = 'glob:*/api/v1/chart/related/owners*';
const chartsEndpoint = 'glob:*/api/v1/chart/?*';

const mockCharts = [...new Array(3)].map((_, i) => ({
  changed_on: new Date().toISOString(),
  creator: 'super user',
  id: i,
  slice_name: `cool chart ${i}`,
  url: 'url',
  viz_type: 'bar',
}));

fetchMock.get(chartsInfoEndpoint, {
  permissions: ['can_list', 'can_edit'],
  filters: {
    slice_name: [],
    description: [],
    viz_type: [],
    datasource_name: [],
    owners: [],
  },
});
fetchMock.get(chartssOwnersEndpoint, {
  result: [],
});
fetchMock.get(chartsEndpoint, {
  result: mockCharts,
  chart_count: 3,
});

describe('ChartList', () => {
  const mockedProps = {};
  const wrapper = mount(<ChartList {...mockedProps} />, {
    context: { store },
  });

  it('renders', () => {
    expect(wrapper.find(ChartList)).toHaveLength(1);
  });

  it('renders a ListView', () => {
    expect(wrapper.find(ListView)).toHaveLength(1);
  });

  it('fetches info', () => {
    const callsI = fetchMock.calls(/chart\/_info/);
    expect(callsI).toHaveLength(1);
  });

  it('fetches owners', () => {
    const callsO = fetchMock.calls(/chart\/related\/owners/);
    expect(callsO).toHaveLength(1);
  });

  it('fetches data', () => {
    wrapper.update();
    const callsD = fetchMock.calls(/chart\/\?q/);
    expect(callsD).toHaveLength(1);
    expect(callsD[0][0]).toMatchInlineSnapshot(
      `"/http//localhost/api/v1/chart/?q={%22order_column%22:%22changed_on%22,%22order_direction%22:%22desc%22,%22page%22:0,%22page_size%22:25}"`,
    );
  });
});
