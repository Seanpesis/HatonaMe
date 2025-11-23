import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  getEvent,
  getGuests,
  getTableArrangement,
  uploadExcel,
  arrangeTables,
  getInvitation,
  getWhatsAppStatus,
  sendBulkWhatsApp,
} from '../../services/api';
import { useDropzone } from 'react-dropzone';

export default function EventDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [event, setEvent] = useState(null);
  const [guests, setGuests] = useState([]);
  const [tables, setTables] = useState([]);
  const [invitation, setInvitation] = useState(null);
  const [whatsappStatus, setWhatsappStatus] = useState(null);
  const [activeTab, setActiveTab] = useState('guests');
  const [loading, setLoading] = useState(true);
  const [tableCapacity, setTableCapacity] = useState(10);

  const loadEventData = async () => {
    try {
      setLoading(true);
      const [eventRes, guestsRes, tablesRes, invitationRes] = await Promise.all([
        getEvent(id),
        getGuests(id),
        getTableArrangement(id),
        getInvitation(id).catch(() => null),
      ]);

      setEvent(eventRes.data);
      setGuests(guestsRes.data);
      setTables(tablesRes.data);
      if (invitationRes) setInvitation(invitationRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadWhatsAppStatus = async () => {
    try {
      const response = await getWhatsAppStatus();
      setWhatsappStatus(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (id) {
      loadEventData();
      loadWhatsAppStatus();
    }
  }, [id]);

  // Poll WhatsApp status every 2 seconds
  useEffect(() => {
    if (!id) return;
    
    const interval = setInterval(() => {
      loadWhatsAppStatus();
    }, 2000); // Check every 2 seconds

    return () => clearInterval(interval);
  }, [id]);

  const onExcelDrop = async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    try {
      await uploadExcel(id, acceptedFiles[0]);
      alert('קובץ Excel נטען בהצלחה!');
      loadEventData();
    } catch (err) {
      alert('שגיאה בטעינת קובץ Excel');
      console.error(err);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onExcelDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    multiple: false,
  });

  const handleArrangeTables = async () => {
    try {
      await arrangeTables(id, { tableCapacity });
      alert('סידורי שולחנות בוצעו בהצלחה!');
      loadEventData();
    } catch (err) {
      alert('שגיאה בסידור השולחנות');
      console.error(err);
    }
  };

  const handleSendBulkWhatsApp = async () => {
    if (!confirm('האם אתה בטוח שברצונך לשלוח הזמנות לכל המוזמנים?')) {
      return;
    }

    try {
      const response = await sendBulkWhatsApp(id, {});
      alert(`נשלחו ${response.data.results.length} הודעות`);
    } catch (err) {
      alert('שגיאה בשליחת הודעות');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">טוען...</div>
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
        <h1>{event.name}</h1>
        {event.date && <p>תאריך: {new Date(event.date).toLocaleDateString('he-IL')}</p>}
        {event.location && <p>מיקום: {event.location}</p>}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button className="btn btn-secondary" onClick={() => router.push('/')}>
            חזרה לרשימת אירועים
          </button>
          <button className="btn btn-primary" onClick={() => router.push(`/events/${id}/stats`)}>
            📊 סטטיסטיקות RSVP
          </button>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
          <button
            className={`btn ${activeTab === 'guests' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('guests')}
          >
            מוזמנים
          </button>
          <button
            className={`btn ${activeTab === 'tables' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('tables')}
          >
            שולחנות
          </button>
          <button
            className={`btn ${activeTab === 'invitation' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('invitation')}
          >
            הזמנה
          </button>
          <button
            className={`btn ${activeTab === 'whatsapp' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('whatsapp')}
          >
            WhatsApp
          </button>
        </div>

        {activeTab === 'guests' && (
          <div>
            <h2>טעינת מוזמנים מקובץ Excel</h2>
            <div
              {...getRootProps()}
              style={{
                border: '2px dashed #667eea',
                borderRadius: '10px',
                padding: '40px',
                textAlign: 'center',
                cursor: 'pointer',
                marginBottom: '20px',
                backgroundColor: isDragActive ? '#f0f0f0' : 'white',
              }}
            >
              <input {...getInputProps()} />
              {isDragActive ? (
                <p>שחרר את הקובץ כאן...</p>
              ) : (
                <p>גרור קובץ Excel לכאן או לחץ לבחירה</p>
              )}
            </div>

            <h2>רשימת מוזמנים ({guests.length})</h2>
            {guests.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>שם</th>
                    <th>קטגוריה</th>
                    <th>טלפון</th>
                    <th>שולחן</th>
                    <th>RSVP</th>
                    <th>כמות</th>
                  </tr>
                </thead>
                <tbody>
                  {guests.map((guest) => (
                    <tr key={guest.id}>
                      <td>{guest.name}</td>
                      <td>{guest.category || '-'}</td>
                      <td>{guest.phone || '-'}</td>
                      <td>{guest.table_number || '-'}</td>
                      <td>
                        <span
                          className={`badge ${
                            guest.rsvp_status === 'confirmed'
                              ? 'badge-success'
                              : guest.rsvp_status === 'declined'
                              ? 'badge-danger'
                              : 'badge-warning'
                          }`}
                        >
                          {guest.rsvp_status === 'confirmed'
                            ? 'מאשר'
                            : guest.rsvp_status === 'declined'
                            ? 'מבטל'
                            : 'ממתין'}
                        </span>
                      </td>
                      <td>{guest.rsvp_guests_count || 1}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>אין מוזמנים עדיין. טען קובץ Excel כדי להוסיף מוזמנים.</p>
            )}
          </div>
        )}

        {activeTab === 'tables' && (
          <div>
            <h2>סידורי שולחנות</h2>
            <div style={{ marginBottom: '20px' }}>
              <label>קיבולת שולחן:</label>
              <input
                type="number"
                className="input"
                value={tableCapacity}
                onChange={(e) => setTableCapacity(parseInt(e.target.value))}
                style={{ width: '100px', display: 'inline-block', marginRight: '10px' }}
              />
              <button className="btn btn-primary" onClick={handleArrangeTables}>
                סדר שולחנות אוטומטית
              </button>
            </div>

            {tables.tables && tables.tables.length > 0 ? (
              <div className="grid">
                {tables.tables.map((table) => (
                  <div key={table.id} className="card">
                    <h3>שולחן {table.table_number}</h3>
                    <p>קטגוריה: {table.category || 'כללי'}</p>
                    <p>מוזמנים: {table.guest_count || 0}</p>
                    {tables.guests && (
                      <ul style={{ marginTop: '10px', listStyle: 'none' }}>
                        {tables.guests
                          .filter((g) => g.table_number === table.table_number)
                          .map((guest) => (
                            <li key={guest.id} style={{ padding: '5px 0' }}>
                              {guest.name} ({guest.rsvp_guests_count || 1})
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p>אין שולחנות מסודרים. לחץ על "סדר שולחנות אוטומטית" כדי להתחיל.</p>
            )}
          </div>
        )}

        {activeTab === 'invitation' && (
          <div>
            <h2>הזמנה לחתונה</h2>
            <Link href={`/events/${id}/invitation`}>
              <button className="btn btn-primary">עלה/ערוך הזמנה</button>
            </Link>
            {invitation && (
              <div style={{ marginTop: '20px' }}>
                <img
                  src={`/api/invitations/image/${invitation.id}`}
                  alt="Invitation"
                  style={{ maxWidth: '100%', borderRadius: '10px' }}
                />
                {invitation.text_overlay && (
                  <p style={{ marginTop: '10px', fontSize: '18px' }}>{invitation.text_overlay}</p>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'whatsapp' && (
          <div>
            <h2>שליחת הזמנות ב-WhatsApp</h2>
            
            {!whatsappStatus && (
              <div className="loading">טוען סטטוס WhatsApp...</div>
            )}

            {whatsappStatus && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ 
                  padding: '15px', 
                  borderRadius: '5px', 
                  marginBottom: '20px',
                  backgroundColor: whatsappStatus.isReady ? '#c6f6d5' : '#feebc8',
                  border: `2px solid ${whatsappStatus.isReady ? '#48bb78' : '#ed8936'}`
                }}>
                  <p style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
                    סטטוס: {whatsappStatus.isReady ? '✅ מחובר' : '⏳ ממתין להתחברות'}
                  </p>
                  
                  {!whatsappStatus.isReady && (
                    <p style={{ marginTop: '10px' }}>
                      {whatsappStatus.qrCode 
                        ? 'סרוק את ה-QR Code למטה עם WhatsApp שלך' 
                        : 'ממתין ל-QR Code... (בדוק את הקונסול)'}
                    </p>
                  )}
                </div>

                {!whatsappStatus.isReady && whatsappStatus.qrCodeImage && (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '30px',
                    backgroundColor: 'white',
                    borderRadius: '10px',
                    border: '2px solid #667eea',
                    marginBottom: '20px'
                  }}>
                    <h3 style={{ marginBottom: '20px' }}>סרוק עם WhatsApp:</h3>
                    <div style={{ 
                      display: 'inline-block', 
                      padding: '20px', 
                      backgroundColor: 'white',
                      borderRadius: '10px',
                      border: '2px solid #ddd'
                    }}>
                      <img 
                        src={whatsappStatus.qrCodeImage} 
                        alt="QR Code" 
                        style={{ 
                          width: '256px', 
                          height: '256px',
                          display: 'block'
                        }}
                      />
                    </div>
                    <div style={{ marginTop: '20px', fontSize: '14px', color: '#666', textAlign: 'right' }}>
                      <p>1. פתח WhatsApp בטלפון</p>
                      <p>2. לחץ על שלוש הנקודות (⋮) → "מכשירים מקושרים"</p>
                      <p>3. לחץ "קישור מכשיר"</p>
                      <p>4. סרוק את ה-QR Code למעלה</p>
                    </div>
                    <button 
                      className="btn btn-secondary" 
                      onClick={loadWhatsAppStatus}
                      style={{ marginTop: '15px' }}
                    >
                      רענן
                    </button>
                  </div>
                )}

                {!whatsappStatus.isReady && whatsappStatus.qrCode && !whatsappStatus.qrCodeImage && (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '30px',
                    backgroundColor: '#feebc8',
                    borderRadius: '10px',
                    marginBottom: '20px'
                  }}>
                    <p>QR Code זמין - ממתין לטעינה...</p>
                    <p style={{ fontSize: '12px', marginTop: '10px' }}>
                      או בדוק את הקונסול - שם מופיע QR Code גם כן
                    </p>
                    <button 
                      className="btn btn-primary" 
                      onClick={loadWhatsAppStatus}
                      style={{ marginTop: '15px' }}
                    >
                      רענן
                    </button>
                  </div>
                )}

                {!whatsappStatus.isReady && !whatsappStatus.qrCode && (
                  <div style={{ 
                    padding: '20px', 
                    backgroundColor: '#fed7d7', 
                    borderRadius: '5px',
                    marginBottom: '20px'
                  }}>
                    <p>⚠️ QR Code לא זמין כרגע</p>
                    <p style={{ fontSize: '14px', marginTop: '10px' }}>
                      בדוק את הקונסול של השרת - שם מופיע QR Code גם כן.
                    </p>
                    <p style={{ fontSize: '14px', marginTop: '5px' }}>
                      אם השרת לא רץ, הפעל אותו עם: <code>npm run dev</code>
                    </p>
                    <button 
                      className="btn btn-primary" 
                      onClick={loadWhatsAppStatus}
                      style={{ marginTop: '15px' }}
                    >
                      נסה שוב
                    </button>
                  </div>
                )}
              </div>
            )}

            <button
              className="btn btn-success"
              onClick={handleSendBulkWhatsApp}
              disabled={!whatsappStatus?.isReady}
              style={{ fontSize: '18px', padding: '15px 30px' }}
            >
              {whatsappStatus?.isReady 
                ? 'שלח הזמנות לכל המוזמנים' 
                : 'התחבר ל-WhatsApp קודם'}
            </button>

            {whatsappStatus?.isReady && (
              <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e6fffa', borderRadius: '5px' }}>
                <p>✅ WhatsApp מחובר ומוכן לשליחה!</p>
                <p style={{ fontSize: '14px', marginTop: '5px' }}>
                  לחץ על הכפתור למעלה כדי לשלוח הזמנות לכל המוזמנים שיש להם מספר טלפון.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

