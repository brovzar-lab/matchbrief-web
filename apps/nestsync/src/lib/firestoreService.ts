import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { CalendarEvent, Expense, Message, SplitType } from './types';

function householdRef(householdId: string) {
  return doc(db!, 'households', householdId);
}

function subCol(householdId: string, sub: string) {
  return collection(db!, 'households', householdId, sub);
}

export async function addCalendarEvent(
  householdId: string,
  data: Omit<CalendarEvent, 'id'>
): Promise<string> {
  const ref = await addDoc(subCol(householdId, 'events'), {
    title: data.title,
    startDate: Timestamp.fromDate(data.startDate),
    endDate: Timestamp.fromDate(data.endDate),
    allDay: data.allDay,
    createdBy: data.createdBy,
  });
  return ref.id;
}

export async function sendMessage(
  householdId: string,
  text: string,
  senderId: string
): Promise<string> {
  const ref = await addDoc(subCol(householdId, 'messages'), {
    text,
    senderId,
    sentAt: serverTimestamp(),
    readBy: [senderId],
  });
  return ref.id;
}

export async function addExpense(
  householdId: string,
  data: { title: string; amount: number; paidBy: string; splitType: SplitType }
): Promise<string> {
  const ref = await addDoc(subCol(householdId, 'expenses'), {
    ...data,
    status: 'unsettled',
    settledAt: null,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function settleExpense(
  householdId: string,
  expenseId: string
): Promise<void> {
  await updateDoc(doc(db!, 'households', householdId, 'expenses', expenseId), {
    status: 'settled',
    settledAt: serverTimestamp(),
  });
}
