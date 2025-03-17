import { useState } from 'react';
import api from '../../utils/api';

export default function CreateChannel({ onCreate }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/channels', { name });
      setName('');
      onCreate();
      setError('');
    } catch (err) {
      setError('Channel name already exists');
    }
  };

  return (
    <div className="create-channel">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="New channel name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <button type="submit">Create</button>
      </form>
      {error && <div className="error">{error}</div>}
    </div>
  );
}