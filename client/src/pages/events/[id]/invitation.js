import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { uploadInvitation, getInvitation } from '../../../services/api';
import { useDropzone } from 'react-dropzone';

export default function InvitationUpload() {
  const router = useRouter();
  const { id } = router.query;
  const [text, setText] = useState('');
  const [position, setPosition] = useState('bottom');
  const [loading, setLoading] = useState(false);
  const [invitation, setInvitation] = useState(null);

  useEffect(() => {
    if (id) {
      loadInvitation();
    }
  }, [id]);

  const loadInvitation = async () => {
    try {
      const response = await getInvitation(id);
      setInvitation(response.data);
      if (response.data.text_overlay) {
        setText(response.data.text_overlay);
      }
    } catch (err) {
      // No invitation yet
    }
  };

  const onImageDrop = async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    setLoading(true);
    try {
      await uploadInvitation(id, acceptedFiles[0], text, position);
      alert('הזמנה נשמרה בהצלחה!');
      loadInvitation();
    } catch (err) {
      alert('שגיאה בשמירת ההזמנה');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onImageDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
    },
    multiple: false,
  });

  return (
    <div className="container">
      <div className="header">
        <h1>העלאת הזמנה לחתונה</h1>
      </div>

      <div className="card">
        <div>
          <label>טקסט להזמנה:</label>
          <textarea
            className="input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows="4"
            placeholder="הכנס טקסט להזמנה..."
          />
        </div>

        <div style={{ marginTop: '20px' }}>
          <label>מיקום הטקסט:</label>
          <select
            className="input"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
          >
            <option value="top">למעלה</option>
            <option value="center">במרכז</option>
            <option value="bottom">למטה</option>
          </select>
        </div>

        <div style={{ marginTop: '20px' }}>
          <label>תמונת הזמנה:</label>
          <div
            {...getRootProps()}
            style={{
              border: '2px dashed #667eea',
              borderRadius: '10px',
              padding: '40px',
              textAlign: 'center',
              cursor: 'pointer',
              marginTop: '10px',
              backgroundColor: isDragActive ? '#f0f0f0' : 'white',
            }}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>שחרר את התמונה כאן...</p>
            ) : (
              <p>גרור תמונת הזמנה לכאן או לחץ לבחירה</p>
            )}
          </div>
        </div>

        {loading && <div className="loading">מעלה...</div>}

        {invitation && (
          <div style={{ marginTop: '20px' }}>
            <h3>הזמנה נוכחית:</h3>
            <img
              src={`/api/invitations/image/${invitation.id}`}
              alt="Invitation"
              style={{ maxWidth: '100%', borderRadius: '10px', marginTop: '10px' }}
            />
          </div>
        )}

        <div style={{ marginTop: '20px' }}>
          <button
            className="btn btn-secondary"
            onClick={() => router.push(`/events/${id}`)}
          >
            חזרה לאירוע
          </button>
        </div>
      </div>
    </div>
  );
}

