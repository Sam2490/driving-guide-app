import React from 'react';
import { Stack } from 'expo-router';
import { useApp } from '@/state/AppProvider';

export default function Layout() {
  const { c } = useApp();
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }} />;
}
