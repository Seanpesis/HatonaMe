// Supabase database client for Netlify Functions
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kcqjepszoofkmkozaehc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjcWplcHN6b29ma21rb3phZWhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4NjA3MjMsImV4cCI6MjA3OTQzNjcyM30.I25302yKGnDFi2DM75Edfy6rdRCLQZ299kmSAg4oHcg';

const supabase = createClient(supabaseUrl, supabaseKey);

class SupabaseDatabase {
  constructor() {
    this.client = supabase;
  }

  // Events operations
  async getAllEvents() {
    const { data, error } = await this.client
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async getEvent(id) {
    const { data, error } = await this.client
      .from('events')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async createEvent(eventData) {
    const { data, error } = await this.client
      .from('events')
      .insert([{
        name: eventData.name,
        date: eventData.date,
        location: eventData.location
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateEvent(id, eventData) {
    const { data, error } = await this.client
      .from('events')
      .update({
        name: eventData.name,
        date: eventData.date,
        location: eventData.location,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteEvent(id) {
    // Delete related data first
    await this.client.from('guests').delete().eq('event_id', id);
    await this.client.from('tables').delete().eq('event_id', id);
    await this.client.from('invitations').delete().eq('event_id', id);
    
    const { error } = await this.client
      .from('events')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }

  // Guests operations
  async getGuests(eventId) {
    const { data, error } = await this.client
      .from('guests')
      .select('*')
      .eq('event_id', eventId)
      .order('name');
    
    if (error) throw error;
    return data || [];
  }

  async getGuest(id) {
    const { data, error } = await this.client
      .from('guests')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async createGuest(guestData) {
    const { data, error } = await this.client
      .from('guests')
      .insert([{
        event_id: guestData.event_id,
        name: guestData.name,
        category: guestData.category || null,
        phone: guestData.phone || null,
        email: guestData.email || null,
        table_id: null,
        rsvp_status: 'pending',
        plus_one: 0,
        dietary_restrictions: null,
        invitation_sent: false
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateGuest(id, guestData) {
    const { data, error } = await this.client
      .from('guests')
      .update(guestData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateGuestRSVP(id, rsvpData) {
    const { data, error } = await this.client
      .from('guests')
      .update({
        rsvp_status: rsvpData.status,
        plus_one: rsvpData.plus_one || 0,
        dietary_restrictions: rsvpData.dietary_restrictions || null,
        rsvp_date: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteGuest(id) {
    const { error } = await this.client
      .from('guests')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
}

module.exports = {
  SupabaseDatabase,
  supabase
};