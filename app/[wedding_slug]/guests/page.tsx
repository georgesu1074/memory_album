'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Guest {
  id: string;
  wedding_id: string;
  full_name: string;
  email?: string;
  phone?: string;
  table_number?: string;
  party_name?: string;
  party_size?: number;
  rsvp_status?: string;
  dietary_restrictions?: string;
  notes?: string;
  created_at: string;
}

interface ImportSummary {
  total: number;
  attending?: number;
  declined?: number;
  imported: number;
  duplicates: number;
  failed: number;
  errors: string[];
}

export default function GuestsPage() {
  const params = useParams();
  const router = useRouter();
  const weddingSlug = params.wedding_slug as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedGuests, setSelectedGuests] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [newGuest, setNewGuest] = useState({
    full_name: '',
    email: '',
    phone: '',
    table_number: '',
    party_name: '',
    dietary_restrictions: '',
    notes: '',
  });

  useEffect(() => {
    fetchGuests();
  }, [weddingSlug]);

  const fetchGuests = async (query = '') => {
    try {
      const url = query 
        ? `/api/weddings/${weddingSlug}/guests/search?q=${encodeURIComponent(query)}&limit=100`
        : `/api/weddings/${weddingSlug}/guests/search?limit=1000`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch guests');
      }

      const data = await response.json();
      setGuests(data.guests || []);
      setLoading(false);
    } catch (err) {
      setError('Failed to load guests');
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    fetchGuests(query);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setError(null);
    setImportSummary(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`/api/weddings/${weddingSlug}/guests/import`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Import failed');
      }

      setImportSummary(data.summary);
      fetchGuests(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import guests');
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAddGuest = async () => {
    if (!newGuest.full_name.trim()) {
      setError('Guest name is required');
      return;
    }

    try {
      const response = await fetch(`/api/weddings/${weddingSlug}/guests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGuest),
      });

      if (!response.ok) {
        throw new Error('Failed to add guest');
      }

      setShowAddForm(false);
      setNewGuest({
        full_name: '',
        email: '',
        phone: '',
        table_number: '',
        party_name: '',
        dietary_restrictions: '',
        notes: '',
      });
      fetchGuests();
    } catch (err) {
      setError('Failed to add guest');
    }
  };

  const handleSelectAll = () => {
    if (selectedGuests.size === guests.length) {
      // Unselect all if all are selected
      setSelectedGuests(new Set());
    } else {
      // Select all
      setSelectedGuests(new Set(guests.map(g => g.id)));
    }
  };

  const handleSelectGuest = (guestId: string) => {
    const newSelected = new Set(selectedGuests);
    if (newSelected.has(guestId)) {
      newSelected.delete(guestId);
    } else {
      newSelected.add(guestId);
    }
    setSelectedGuests(newSelected);
  };

  const handleDeleteSelected = async () => {
    if (selectedGuests.size === 0) return;
    
    const confirmMessage = selectedGuests.size === 1 
      ? 'Are you sure you want to delete this guest?' 
      : `Are you sure you want to delete ${selectedGuests.size} guests?`;
    
    if (!confirm(confirmMessage)) return;

    setDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/weddings/${weddingSlug}/guests/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestIds: Array.from(selectedGuests) }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete guests');
      }

      const result = await response.json();
      
      // Clear selection and refresh
      setSelectedGuests(new Set());
      await fetchGuests();
      
      // Show success message briefly
      setImportSummary(null);
      setError(null);
    } catch (err) {
      setError('Failed to delete guests');
    } finally {
      setDeleting(false);
    }
  };

  const exportGuests = () => {
    const headers = ['Name', 'Email', 'Phone', 'Table', 'Party', 'Party Size', 'RSVP', 'Dietary', 'Notes'];
    const rows = guests.map(g => [
      g.full_name,
      g.email || '',
      g.phone || '',
      g.table_number || '',
      g.party_name || '',
      g.party_size?.toString() || '',
      g.rsvp_status || '',
      g.dietary_restrictions || '',
      g.notes || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${weddingSlug}-guests.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading guests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/${weddingSlug}/config`}
            className="text-purple-600 hover:text-purple-700 mb-4 inline-block"
          >
            ← Back to Configuration
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Guest List Management</h1>
          <p className="text-gray-600 mt-2">Import, manage, and search your wedding guests</p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {importSummary && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">Import Summary</h3>
            <div className="text-green-700 space-y-1">
              <p>Total valid guests in CSV: {importSummary.total}</p>
              {importSummary.declined !== undefined && importSummary.declined > 0 && (
                <p className="text-gray-600">Declined/Not attending (skipped): {importSummary.declined}</p>
              )}
              {importSummary.attending !== undefined && (
                <p>Attending guests processed: {importSummary.attending}</p>
              )}
              <p className="font-semibold">Successfully imported: {importSummary.imported}</p>
              {importSummary.duplicates > 0 && <p>Duplicates skipped: {importSummary.duplicates}</p>}
              {importSummary.failed > 0 && <p className="text-red-600">Failed: {importSummary.failed}</p>}
              {importSummary.errors.length > 0 && (
                <div className="mt-2 text-sm text-red-600">
                  {importSummary.errors.map((err, idx) => (
                    <p key={idx}>{err}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search guests by name, email, or party..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {selectedGuests.size > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : `Delete (${selectedGuests.size})`}
                </button>
              )}

              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Add Guest
              </button>

              <label className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer">
                {importing ? 'Importing...' : 'Import CSV'}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  disabled={importing}
                  className="hidden"
                />
              </label>

              {guests.length > 0 && (
                <button
                  onClick={exportGuests}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Export CSV
                </button>
              )}
            </div>
          </div>

          {/* Add Guest Form */}
          {showAddForm && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-4">Add New Guest</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Full Name *"
                  value={newGuest.full_name}
                  onChange={(e) => setNewGuest({ ...newGuest, full_name: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={newGuest.email}
                  onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={newGuest.phone}
                  onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Table Number"
                  value={newGuest.table_number}
                  onChange={(e) => setNewGuest({ ...newGuest, table_number: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Party Name"
                  value={newGuest.party_name}
                  onChange={(e) => setNewGuest({ ...newGuest, party_name: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Dietary Restrictions"
                  value={newGuest.dietary_restrictions}
                  onChange={(e) => setNewGuest({ ...newGuest, dietary_restrictions: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <textarea
                  placeholder="Notes"
                  value={newGuest.notes}
                  onChange={(e) => setNewGuest({ ...newGuest, notes: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg md:col-span-2"
                  rows={2}
                />
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={handleAddGuest}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Save Guest
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{guests.length}</p>
              <p className="text-sm text-gray-600">Total Guests</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {new Set(guests.map(g => g.party_name).filter(Boolean)).size}
              </p>
              <p className="text-sm text-gray-600">Parties</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {new Set(guests.map(g => g.table_number).filter(Boolean)).size}
              </p>
              <p className="text-sm text-gray-600">Tables</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {guests.filter(g => g.dietary_restrictions).length}
              </p>
              <p className="text-sm text-gray-600">Dietary Needs</p>
            </div>
          </div>
        </div>

        {/* Guest List Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {guests.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 mb-4">No guests added yet</p>
              <p className="text-sm text-gray-400">
                Import a CSV file or add guests manually to get started
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={guests.length > 0 && selectedGuests.size === guests.length}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Table
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Party
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      RSVP
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dietary
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {guests.map((guest) => (
                    <tr key={guest.id} className={`hover:bg-gray-50 ${selectedGuests.has(guest.id) ? 'bg-purple-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedGuests.has(guest.id)}
                          onChange={() => handleSelectGuest(guest.id)}
                          className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {guest.full_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {guest.email || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {guest.phone || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {guest.table_number || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {guest.party_name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {guest.rsvp_status || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {guest.dietary_restrictions || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* CSV Format Help */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">CSV Import Format</h3>
          <p className="text-sm text-blue-700 mb-2">
            Your CSV should include these columns (in any order):
          </p>
          <code className="block text-xs bg-white p-2 rounded text-gray-700">
            Name, Email, Phone, Table Number, Party Name, Party Size, RSVP Status, Dietary Restrictions, Notes
          </code>
          <p className="text-xs text-blue-600 mt-2">
            The first row should be headers. Only "Name" is required.
          </p>
        </div>
      </div>
    </div>
  );
}