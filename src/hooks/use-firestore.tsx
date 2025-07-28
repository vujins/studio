'use client';
import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';

interface DocumentWithId {
  id: string;
}

export const useCollection = <T extends DocumentWithId>(collectionName: string) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const collectionRef = collection(db, collectionName);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collectionRef,
      (snapshot) => {
        const newData: T[] = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
          id: doc.id,
          ...doc.data(),
        } as T));
        setData(newData);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName]);

  const add = useCallback(async (item: Omit<T, 'id'>) => {
    try {
      const docRef = await addDoc(collectionRef, item);
      return docRef.id;
    } catch (e) {
      console.error("Error adding document: ", e);
      throw e;
    }
  }, [collectionName]);

  const update = useCallback(async (id: string, updates: Partial<T>) => {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, updates);
    } catch (e) {
        console.error("Error updating document: ", e);
        throw e;
    }
  }, [collectionName]);

  const remove = useCallback(async (id: string) => {
    try {
        const docRef = doc(db, collectionName, id);
        await deleteDoc(docRef);
    } catch(e) {
        console.error("Error deleting document: ", e);
        throw e;
    }
  }, [collectionName]);

  return { data, loading, error, add, update, remove, setData };
};
