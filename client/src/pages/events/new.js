import { useState } from 'react';
import { useRouter } from 'next/router';
import { createEvent } from '../../services/api';

export default function NewEvent() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    location: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await createEvent(formData);
      router.push(`/events/${response.data.id}`);
    } catch (err) {
      setError('שגיאה ביצירת האירוע');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>יצירת אירוע חדש</h1>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div>
            <label>שם האירוע *</label>
            <input
              type="text"
              className="input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label>תאריך</label>
            <input
              type="date"
              className="input"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          <div>
            <label>מיקום</label>
            <input
              type="text"
              className="input"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          {error && <div className="error">{error}</div>}

          <div style={{ marginTop: '20px' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'יוצר...' : 'צור אירוע'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => router.push('/')}
            >
              ביטול
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

