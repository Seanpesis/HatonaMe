import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getEvent, getGuests } from '../../../services/api';

export default function EventStatsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [event, setEvent] = useState(null);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    declined: 0,
    pending: 0,
    totalAttendees: 0
  });

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  useEffect(() => {
    calculateStats();
  }, [guests]);

  const loadData = async () => {
    try {
      const [eventResponse, guestsResponse] = await Promise.all([
        getEvent(id),
        getGuests(id)
      ]);
      
      setEvent(eventResponse.data);
      setGuests(guestsResponse.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    if (!guests.length) {
      setStats({ total: 0, confirmed: 0, declined: 0, pending: 0, totalAttendees: 0 });
      return;
    }

    const confirmed = guests.filter(g => g.rsvp_status === 'confirmed');
    const declined = guests.filter(g => g.rsvp_status === 'declined');
    const pending = guests.filter(g => g.rsvp_status === 'pending' || !g.rsvp_status);
    
    const totalAttendees = confirmed.reduce((sum, guest) => {
      return sum + 1 + (guest.plus_one || 0);
    }, 0);

    setStats({
      total: guests.length,
      confirmed: confirmed.length,
      declined: declined.length,
      pending: pending.length,
      totalAttendees
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      confirmed: { text: 'מאשר', class: 'badge-success', icon: '✅' },
      declined: { text: 'מבטל', class: 'badge-danger', icon: '❌' },
      pending: { text: 'ממתין', class: 'badge-warning', icon: '⏳' }
    };
    
    const badge = badges[status] || badges.pending;
    return (
      <span className={`badge ${badge.class}`}>
        {badge.icon} {badge.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">טוען נתונים...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container">
        <div className="error">אירוע לא נמצא</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1>📊 סטטיסטיקות RSVP</h1>
        <h2>{event.name}</h2>
        <p>📅 {event.date} | 📍 {event.location}</p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">סך הכל מוזמנים</div>
        </div>
        
        <div className="stat-card confirmed">
          <div className="stat-number">{stats.confirmed}</div>
          <div className="stat-label">✅ מאשרים הגעה</div>
        </div>
        
        <div className="stat-card attendees">
          <div className="stat-number">{stats.totalAttendees}</div>
          <div className="stat-label">👥 סך הכל משתתפים</div>
        </div>
        
        <div className="stat-card declined">
          <div className="stat-number">{stats.declined}</div>
          <div className="stat-label">❌ מבטלים הגעה</div>
        </div>
        
        <div className="stat-card pending">
          <div className="stat-number">{stats.pending}</div>
          <div className="stat-label">⏳ ממתינים לתשובה</div>
        </div>
        
        <div className="stat-card response-rate">
          <div className="stat-number">
            {stats.total > 0 ? Math.round(((stats.confirmed + stats.declined) / stats.total) * 100) : 0}%
          </div>
          <div className="stat-label">📈 אחוז תגובות</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-section">
        <h3>התקדמות תגובות</h3>
        <div className="progress-bar">
          <div 
            className="progress-confirmed" 
            style={{ width: `${(stats.confirmed / stats.total) * 100}%` }}
          ></div>
          <div 
            className="progress-declined" 
            style={{ width: `${(stats.declined / stats.total) * 100}%` }}
          ></div>
        </div>
        <div className="progress-labels">
          <span className="label-confirmed">✅ {stats.confirmed} מאשרים</span>
          <span className="label-declined">❌ {stats.declined} מבטלים</span>
          <span className="label-pending">⏳ {stats.pending} ממתינים</span>
        </div>
      </div>

      {/* Recent Responses */}
      <div className="recent-section">
        <h3>תגובות אחרונות</h3>
        <div className="responses-list">
          {guests
            .filter(g => g.rsvp_date)
            .sort((a, b) => new Date(b.rsvp_date) - new Date(a.rsvp_date))
            .slice(0, 10)
            .map(guest => (
              <div key={guest.id} className="response-item">
                <div className="guest-info">
                  <span className="guest-name">{guest.name}</span>
                  <span className="response-date">
                    {new Date(guest.rsvp_date).toLocaleDateString('he-IL')}
                  </span>
                </div>
                <div className="response-details">
                  {getStatusBadge(guest.rsvp_status)}
                  {guest.rsvp_status === 'confirmed' && (
                    <span className="attendees-count">
                      👥 {1 + (guest.plus_one || 0)} משתתפים
                    </span>
                  )}
                </div>
              </div>
            ))
          }
        </div>
      </div>

      {/* Action Buttons */}
      <div className="actions">
        <button 
          onClick={() => router.push(`/events/${id}`)}
          className="btn btn-primary"
        >
          חזור לאירוע
        </button>
        
        <button 
          onClick={loadData}
          className="btn btn-secondary"
        >
          🔄 רענן נתונים
        </button>
      </div>

      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          direction: rtl;
        }

        .header {
          text-align: center;
          margin-bottom: 40px;
          padding: 30px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 15px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .stat-card {
          background: white;
          padding: 30px 20px;
          border-radius: 15px;
          text-align: center;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          border-top: 4px solid #ddd;
          transition: transform 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-5px);
        }

        .stat-card.total { border-top-color: #6c757d; }
        .stat-card.confirmed { border-top-color: #28a745; }
        .stat-card.attendees { border-top-color: #007bff; }
        .stat-card.declined { border-top-color: #dc3545; }
        .stat-card.pending { border-top-color: #ffc107; }
        .stat-card.response-rate { border-top-color: #17a2b8; }

        .stat-number {
          font-size: 3em;
          font-weight: bold;
          margin-bottom: 10px;
        }

        .stat-label {
          font-size: 1.1em;
          color: #666;
        }

        .progress-section {
          background: white;
          padding: 30px;
          border-radius: 15px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          margin-bottom: 30px;
        }

        .progress-bar {
          height: 30px;
          background: #f8f9fa;
          border-radius: 15px;
          overflow: hidden;
          display: flex;
          margin: 20px 0;
        }

        .progress-confirmed {
          background: #28a745;
          transition: width 0.5s ease;
        }

        .progress-declined {
          background: #dc3545;
          transition: width 0.5s ease;
        }

        .progress-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.9em;
        }

        .recent-section {
          background: white;
          padding: 30px;
          border-radius: 15px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          margin-bottom: 30px;
        }

        .responses-list {
          max-height: 400px;
          overflow-y: auto;
        }

        .response-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          border-bottom: 1px solid #eee;
          transition: background 0.2s ease;
        }

        .response-item:hover {
          background: #f8f9fa;
        }

        .guest-info {
          display: flex;
          flex-direction: column;
        }

        .guest-name {
          font-weight: bold;
          font-size: 1.1em;
        }

        .response-date {
          font-size: 0.9em;
          color: #666;
        }

        .response-details {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .badge {
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 0.85em;
          font-weight: bold;
        }

        .badge-success { background: #d4edda; color: #155724; }
        .badge-danger { background: #f8d7da; color: #721c24; }
        .badge-warning { background: #fff3cd; color: #856404; }

        .attendees-count {
          font-size: 0.9em;
          color: #666;
        }

        .actions {
          display: flex;
          gap: 15px;
          justify-content: center;
        }

        .btn {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .btn-primary { background: #007bff; color: white; }
        .btn-secondary { background: #6c757d; color: white; }

        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }

        .loading, .error {
          text-align: center;
          padding: 50px;
          font-size: 18px;
        }

        .error { color: #dc3545; }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
          }
          
          .stat-card {
            padding: 20px 15px;
          }
          
          .stat-number {
            font-size: 2em;
          }
          
          .actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}