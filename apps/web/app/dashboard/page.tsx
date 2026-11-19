import type { Metadata } from 'next';
import { DashboardWorkspace } from './workspace';

export const metadata: Metadata = { title: 'Foundation Dashboard' };

export default function DashboardPage() {
  return <DashboardWorkspace />;
}
