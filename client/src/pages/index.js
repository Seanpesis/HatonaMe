import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getEvents, deleteEvent } from '../services/api';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await getEvents();
      if (response.data) {
        setEvents(response.data);
        setError(null);
      } else {
        setError('לא התקבלו נתונים מהשרת');
      }
    } catch (err) {
      console.error('Error loading events:', err);
      console.error('API URL:', process.env.NEXT_PUBLIC_API_URL || 'לא מוגדר');
      setError(`שגיאה בטעינת האירועים: ${err.message || 'השרת לא נגיש'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק את האירוע?')) {
      return;
    }

    try {
      await deleteEvent(id);
      loadEvents();
    } catch (err) {
      alert('שגיאה במחיקת האירוע');
      console.error(err);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>תכנון חתונה - HatonaME</h1>
        <p>ניהול אירועים, סידורי שולחנות ושליחת הזמנות</p>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>האירועים שלי</h2>
          <button className="btn btn-primary" onClick={() => router.push('/events/new')}>
            + יצירת אירוע חדש
          </button>
        </div>

        {loading && <div className="loading">טוען...</div>}
        {error && (
          <div className="error">
            <h3>{error}</h3>
            <p style={{ marginTop: '10px', fontSize: '14px' }}>
              <strong>פתרון:</strong> ודא שהשרת רץ ונגיש.
            </p>
            <details style={{ marginTop: '15px', fontSize: '12px' }}>
              <summary>פרטים טכניים</summary>
              <p>API URL: {process.env.NEXT_PUBLIC_API_URL || 'לא מוגדר (משתמש ב-localhost)'}</p>
              <p>אם השרת לא רץ, העלה אותו ל-Railway או Render.</p>
            </details>
          </div>
        )}

        {!loading && events.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>אין אירועים עדיין. צור אירוע חדש כדי להתחיל!</p>
          </div>
        )}

        {!loading && events.length > 0 && (
          <div className="grid">
            {events.map((event) => (
              <div key={event.id} className="card">
                <h3>{event.name}</h3>
                {event.date && <p>תאריך: {new Date(event.date).toLocaleDateString('he-IL')}</p>}
                {event.location && <p>מיקום: {event.location}</p>}
                <div style={{ marginTop: '15px' }}>
                  <Link href={`/events/${event.id}`}>
                    <button className="btn btn-primary">פתח אירוע</button>
                  </Link>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(event.id)}
                  >
                    מחק
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

