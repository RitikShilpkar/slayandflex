// src/pages/BrandAnalyticsPage/BrandAnalyticsPage.tsx

import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import styles from './BrandAnalyticsPage.module.css';

const BrandAnalyticsPage: React.FC = () => {
  // Dummy data for now
  const data = [
    { name: 'Day 1', impressions: 400, clicks: 240, sales: 24 },
    { name: 'Day 2', impressions: 300, clicks: 139, sales: 22 },
    { name: 'Day 3', impressions: 200, clicks: 980, sales: 29 },
    { name: 'Day 4', impressions: 278, clicks: 390, sales: 20 },
    { name: 'Day 5', impressions: 189, clicks: 480, sales: 27 },
    { name: 'Day 6', impressions: 239, clicks: 380, sales: 23 },
    { name: 'Day 7', impressions: 349, clicks: 430, sales: 25 },
  ];

  return (
    <div className={styles['analytics-page']}>
      <h1 className={styles['title']}>Brand Analytics</h1>
      <div className={styles['chart-container']}>
        <h2>Impressions Over Time</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="impressions" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className={styles['chart-container']}>
        <h2>Clicks Over Time</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <CartesianGrid strokeDasharray="3 3" />
            <Bar dataKey="clicks" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className={styles['chart-container']}>
        <h2>Sales Over Time</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="sales" stroke="#ff7300" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BrandAnalyticsPage;
