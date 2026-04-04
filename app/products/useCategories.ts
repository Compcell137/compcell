import { useEffect, useState } from 'react';
import { fetchCategories, Category } from '../categories/firebase-categories';

export default function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories().then(data => {
      setCategories(data);
      setLoading(false);
    });
  }, []);

  return { categories, loading };
}
