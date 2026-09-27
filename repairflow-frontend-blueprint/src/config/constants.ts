import { RepairStatus, Priority } from '@/types';

export const REPAIR_PIPELINE_STATUSES: RepairStatus[] = [
  'RECEIVED',
  'DIAGNOSING',
  'WAITING_FOR_APPROVAL',
  'APPROVED',
  'WAITING_FOR_PARTS',
  'IN_REPAIR',
  'QUALITY_CHECK',
  'READY_FOR_PICKUP',
  'DELIVERED',
];

export const STATUS_LABELS: Record<RepairStatus, string> = {
  RECEIVED: 'Received',
  DIAGNOSING: 'Diagnosing',
  WAITING_FOR_APPROVAL: 'Waiting Approval',
  APPROVED: 'Approved',
  WAITING_FOR_PARTS: 'Waiting for Parts',
  IN_REPAIR: 'In Repair',
  QUALITY_CHECK: 'Quality Check',
  READY_FOR_PICKUP: 'Ready for Pickup',
  DELIVERED: 'Delivered',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
  UNABLE_TO_REPAIR: 'Unable to Repair',
};

export const STATUS_COLORS: Record<RepairStatus, { bg: string; text: string; border: string; dot: string }> = {
  RECEIVED: { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-300', dot: 'bg-slate-500' },
  DIAGNOSING: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300', dot: 'bg-blue-500' },
  WAITING_FOR_APPROVAL: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300', dot: 'bg-amber-500' },
  APPROVED: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300', dot: 'bg-emerald-500' },
  WAITING_FOR_PARTS: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300', dot: 'bg-orange-500' },
  IN_REPAIR: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300', dot: 'bg-purple-500' },
  QUALITY_CHECK: { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-300', dot: 'bg-indigo-500' },
  READY_FOR_PICKUP: { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-300', dot: 'bg-teal-500' },
  DELIVERED: { bg: 'bg-green-100', text: 'text-green-900', border: 'border-green-300', dot: 'bg-green-600' },
  REJECTED: { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-300', dot: 'bg-rose-500' },
  CANCELLED: { bg: 'bg-gray-200', text: 'text-gray-700', border: 'border-gray-400', dot: 'bg-gray-500' },
  UNABLE_TO_REPAIR: { bg: 'bg-red-200', text: 'text-red-900', border: 'border-red-400', dot: 'bg-red-600' },
};

export const PRIORITY_COLORS: Record<Priority, { bg: string; text: string; badge: string }> = {
  LOW: { bg: 'bg-gray-100', text: 'text-gray-700', badge: 'bg-gray-100 text-gray-700 border-gray-300' },
  MEDIUM: { bg: 'bg-blue-100', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700 border-blue-300' },
  HIGH: { bg: 'bg-amber-100', text: 'text-amber-800', badge: 'bg-amber-100 text-amber-800 border-amber-300' },
  CRITICAL: { bg: 'bg-rose-100', text: 'text-rose-800', badge: 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse' },
};

export const VALID_STATUS_TRANSITIONS: Record<RepairStatus, RepairStatus[]> = {
  RECEIVED: ['DIAGNOSING', 'CANCELLED'],
  DIAGNOSING: ['WAITING_FOR_APPROVAL', 'APPROVED', 'UNABLE_TO_REPAIR', 'CANCELLED'],
  WAITING_FOR_APPROVAL: ['APPROVED', 'REJECTED', 'CANCELLED'],
  APPROVED: ['IN_REPAIR', 'WAITING_FOR_PARTS', 'CANCELLED'],
  WAITING_FOR_PARTS: ['IN_REPAIR', 'CANCELLED'],
  IN_REPAIR: ['QUALITY_CHECK', 'WAITING_FOR_PARTS', 'UNABLE_TO_REPAIR'],
  QUALITY_CHECK: ['READY_FOR_PICKUP', 'IN_REPAIR'], // Can send back to repair if QC fails!
  READY_FOR_PICKUP: ['DELIVERED'],
  DELIVERED: [], // Terminal
  REJECTED: ['DIAGNOSING', 'CANCELLED'], // Can re-evaluate if customer reconsiders
  CANCELLED: [],
  UNABLE_TO_REPAIR: ['READY_FOR_PICKUP', 'DELIVERED'],
};

export const DEFAULT_QC_ITEMS = [
  { key: 'display_touch', label: 'Screen Display, Multi-touch & Brightness' },
  { key: 'battery_charging', label: 'Battery Health, Charging Port & Fast Charge' },
  { key: 'camera_sensors', label: 'Front & Rear Cameras, Flash, Face ID / Fingerprint' },
  { key: 'audio_mic', label: 'Ear Speaker, Loudspeaker, Microphones' },
  { key: 'network_wireless', label: 'Wi-Fi, Cellular, Bluetooth & GPS' },
  { key: 'physical_buttons', label: 'Power Button, Volume Keys & Mute Switch' },
  { key: 'chassis_screws', label: 'Internal Screws, Water Seal Gasket & Frame Alignment' },
];
