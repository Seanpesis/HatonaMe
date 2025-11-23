import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getGuest, submitRSVP } from '../../../services/api';

export default function RSVPPage() {
  const router = useRouter();
  const { eventId, guestId } = router.query;
  const [guest, setGuest] = useState(null);
  const [status, setStatus] = useState('pending');
  const [guestsCount, setGuestsCount] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (eventId && guestId) {
      loadGuest();
    }
  }, [eventId, guestId]);

  const loadGuest = async () => {
    try {
      const response = await getGuest(guestId);
      if (response.data) {
        setGuest(response.data);
        setStatus(response.data.rsvp_status || 'pending');
        setGuestsCount((response.data.plus_one || 0) + 1);
      } else {
        console.error('Guest data is null');
      }
    } catch (err) {
      console.error('Error loading guest:', err);
      console.error('API URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api');
      console.error('Guest ID:', guestId);
      console.error('Event ID:', eventId);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await submitRSVP(eventId, guestId, {
        status,
        plus_one: guestsCount - 1, // minus the guest themselves
        dietary_restrictions: '', // could add this field later
      });
      setSubmitted(true);
    } catch (err) {
      alert('שגיאה בשליחת התשובה');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">טוען...</div>
      </div>
    );
  }

  if (!guest && !loading) {
    return (
      <div className="container">
        <div className="header">
          <h1>אישור הגעה לחתונה</h1>
        </div>
        <div className="card">
          <div className="error">
            <h2>מוזמן לא נמצא</h2>
            <p>ייתכן שהקישור לא תקין או שהשרת לא זמין כרגע.</p>
            <p style={{ fontSize: '14px', marginTop: '10px' }}>
              אם הבעיה נמשכת, אנא פנה למארגני האירוע.
            </p>
            <details style={{ marginTop: '15px', fontSize: '12px' }}>
              <summary>פרטים טכניים (לפיתוח)</summary>
              <p>Event ID: {eventId}</p>
              <p>Guest ID: {guestId}</p>
              <p>API URL: {process.env.NEXT_PUBLIC_API_URL || 'לא מוגדר (משתמש ב-localhost)'}</p>
            </details>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="container">
        <div className="header">
          <h1>תודה רבה!</h1>
        </div>
        <div className="card">
          <div className="success">
            <h2>תשובתך נשמרה בהצלחה!</h2>
            <p>אנחנו מצפים לראות אותך בחתונה!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1>אישור הגעה לחתונה</h1>
        <p>שלום {guest.name}!</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontSize: '18px' }}>
              האם תגיע/י לחתונה?
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className={`btn ${status === 'confirmed' ? 'btn-success' : 'btn-secondary'}`}
                onClick={() => setStatus('confirmed')}
              >
                כן, אני מגיע/ה
              </button>
              <button
                type="button"
                className={`btn ${status === 'declined' ? 'btn-danger' : 'btn-secondary'}`}
                onClick={() => setStatus('declined')}
              >
                לא, אני לא מגיע/ה
              </button>
            </div>
          </div>

          {status === 'confirmed' && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px' }}>
                כמה אנשים יגיעו? (כולל אותך)
              </label>
              <input
                type="number"
                className="input"
                min="1"
                value={guestsCount}
                onChange={(e) => setGuestsCount(parseInt(e.target.value) || 1)}
                required
              />
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
            style={{ fontSize: '18px', padding: '15px 30px' }}
          >
            {submitting ? 'שולח...' : 'שלח תשובה'}
          </button>
        </form>
      </div>
    </div>
  );
}

