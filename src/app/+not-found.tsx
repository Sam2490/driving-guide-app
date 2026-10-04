import React from 'react';
import { router } from 'expo-router';
import { useApp } from '@/state/AppProvider';
import { Button, EmptyState, Screen } from '@/components/ui';

/** Unknown routes and deep links land here instead of the router's default English page. */
export default function NotFound() {
  const { t } = useApp();
  return (
    <Screen back tabSpace={false}>
      <EmptyState text={t.errors.notFound} action={<Button title={t.common.home} onPress={() => router.replace('/')} />} />
    </Screen>
  );
}
