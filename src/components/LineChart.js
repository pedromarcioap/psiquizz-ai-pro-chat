import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const LineChart = ({ data, dataKey, nameKey, color, label }) => (
  <div style={{ width: '100%', height: 300 }}>
    <ResponsiveContainer>
      <RechartsLineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={nameKey} />
        <YAxis domain={[0, 100]} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey={dataKey} stroke={color || '#8884d8'} name={label} dot />
      </RechartsLineChart>
    </ResponsiveContainer>
  </div>
);

export default LineChart;
