import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Home, Users, Building, Trash2, Edit3, Save, X } from "lucide-react";

interface Props { userId: string }

export default function MyListings({ userId }: Props) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>({ rooms: [], flatmates: [], pgs: [] });
  const [editing, setEditing] = useState<{ type: 'room'|'flatmate'|'pg'|null, id: string|null }>({ type: null, id: null });
  const [form, setForm] = useState<any>({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/my/listings?userId=${userId}`);
      const json = await res.json();
      if (json.success) setData(json.data); else setData({ rooms: [], flatmates: [], pgs: [] });
    } catch {
      setData({ rooms: [], flatmates: [], pgs: [] });
    } finally { setLoading(false); }
  };

  useEffect(() => { if (userId) fetchData(); }, [userId]);

  const beginEdit = (type: 'room'|'flatmate'|'pg', item: any) => {
    setEditing({ type, id: item.id });
    if (type === 'room') setForm({ title: item.title, description: item.description, rent: item.rent, deposit: item.deposit, amenities: item.amenities || [] });
    if (type === 'flatmate') setForm({ profession: item.profession, about: item.about, budgetMin: item.budget?.min, budgetMax: item.budget?.max, lifestyle: item.preferences?.lifestyle || [] });
    if (type === 'pg') setForm({ name: item.name, description: item.description });
  };

  const cancelEdit = () => { setEditing({ type: null, id: null }); setForm({}); };

  const saveEdit = async () => {
    if (!editing.type || !editing.id) return;
    const payload: any = { userId };
    if (editing.type === 'room') {
      payload.title = form.title; payload.description = form.description;
      payload.rent = Number(form.rent) || 0; payload.deposit = Number(form.deposit) || 0;
      if (Array.isArray(form.amenities)) payload.amenities = form.amenities;
    } else if (editing.type === 'flatmate') {
      payload.profession = form.profession; payload.about = form.about;
      payload.budget = { min: Number(form.budgetMin) || 0, max: Number(form.budgetMax) || 0 };
      if (Array.isArray(form.lifestyle)) payload.lifestyle = form.lifestyle;
    } else if (editing.type === 'pg') {
      payload.name = form.name; payload.description = form.description;
    }
    const res = await fetch(`/api/my/listings/${editing.type}/${editing.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const json = await res.json();
    if (json.success) { await fetchData(); cancelEdit(); }
  };

  const toggleActive = async (type: 'room'|'flatmate'|'pg', id: string, current: boolean) => {
    await fetch(`/api/my/listings/${type}/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, isActive: !current }) });
    fetchData();
  };

  const deleteItem = async (type: 'room'|'flatmate'|'pg', id: string) => {
    await fetch(`/api/my/listings/${type}/${id}?userId=${userId}`, { method: 'DELETE' });
    fetchData();
  };

  const Section = ({ title, icon, items, type }: any) => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">{icon}{title} <Badge variant="outline" className="ml-2">{items.length}</Badge></CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-gray-500">No items yet.</div>
        ) : (
          <div className="space-y-4">
            {items.map((item: any) => (
              <div key={item.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {type === 'room' && (
                      <>
                        <div className="font-semibold">{item.title}</div>
                        <div className="text-sm text-gray-600">₹{item.rent} • Deposit ₹{item.deposit}</div>
                      </>
                    )}
                    {type === 'flatmate' && (
                      <>
                        <div className="font-semibold">{item.name}</div>
                        <div className="text-sm text-gray-600">{item.profession} • ₹{item.budget?.min}-{item.budget?.max}</div>
                      </>
                    )}
                    {type === 'pg' && (
                      <>
                        <div className="font-semibold">{item.name}</div>
                        <div className="text-sm text-gray-600">Rooms: {item.roomTypes?.length || 0}</div>
                      </>
                    )}
                    <div className="mt-2 text-xs text-gray-500">Posted {new Date(item.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs">Active</Label>
                      <Switch checked={item.isActive} onCheckedChange={() => toggleActive(type, item.id, item.isActive)} />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => beginEdit(type, item)} className="flex items-center gap-1"><Edit3 size={14} /> Edit</Button>
                      <Button size="sm" variant="outline" onClick={() => deleteItem(type, item.id)} className="flex items-center gap-1"><Trash2 size={14} /> Delete</Button>
                    </div>
                  </div>
                </div>

                {editing.type === type && editing.id === item.id && (
                  <div className="mt-4 border-t pt-4 space-y-3">
                    {type === 'room' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label>Title</Label>
                          <Input value={form.title || ''} onChange={e=>setForm((p:any)=>({...p, title:e.target.value}))} />
                        </div>
                        <div>
                          <Label>Rent</Label>
                          <Input type="number" value={form.rent || ''} onChange={e=>setForm((p:any)=>({...p, rent:e.target.value}))} />
                        </div>
                        <div>
                          <Label>Deposit</Label>
                          <Input type="number" value={form.deposit || ''} onChange={e=>setForm((p:any)=>({...p, deposit:e.target.value}))} />
                        </div>
                        <div className="md:col-span-2">
                          <Label>Description</Label>
                          <Textarea value={form.description || ''} onChange={e=>setForm((p:any)=>({...p, description:e.target.value}))} rows={3} />
                        </div>
                        <div className="md:col-span-2">
                          <Label>Amenities</Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {['WiFi','AC','Parking','Security','Housekeeping','Gym','Laundry','Kitchen','TV','Fridge','Washing Machine','Power Backup'].map((a)=> (
                              <Button
                                key={a}
                                type="button"
                                size="sm"
                                variant={Array.isArray(form.amenities) && form.amenities.includes(a) ? 'default' : 'outline'}
                                onClick={()=> setForm((p:any)=>{
                                  const list = Array.isArray(p.amenities) ? [...p.amenities] : [];
                                  const idx = list.indexOf(a);
                                  if (idx >= 0) list.splice(idx,1); else list.push(a);
                                  return { ...p, amenities: list };
                                })}
                              >{a}</Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    {type === 'flatmate' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label>Profession</Label>
                          <Input value={form.profession || ''} onChange={e=>setForm((p:any)=>({...p, profession:e.target.value}))} />
                        </div>
                        <div>
                          <Label>Budget Min</Label>
                          <Input type="number" value={form.budgetMin || ''} onChange={e=>setForm((p:any)=>({...p, budgetMin:e.target.value}))} />
                        </div>
                        <div>
                          <Label>Budget Max</Label>
                          <Input type="number" value={form.budgetMax || ''} onChange={e=>setForm((p:any)=>({...p, budgetMax:e.target.value}))} />
                        </div>
                        <div className="md:col-span-2">
                          <Label>About</Label>
                          <Textarea value={form.about || ''} onChange={e=>setForm((p:any)=>({...p, about:e.target.value}))} rows={3} />
                        </div>
                        <div className="md:col-span-2">
                          <Label>Lifestyle Tags</Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {['Non-smoking','Vegetarian','Working Professional','Student','Early Riser','Night Owl','Pet Friendly','Party Lover','Fitness Enthusiast','Music Lover'].map((l)=> (
                              <Button
                                key={l}
                                type="button"
                                size="sm"
                                variant={Array.isArray(form.lifestyle) && form.lifestyle.includes(l) ? 'default' : 'outline'}
                                onClick={()=> setForm((p:any)=>{
                                  const list = Array.isArray(p.lifestyle) ? [...p.lifestyle] : [];
                                  const idx = list.indexOf(l);
                                  if (idx >= 0) list.splice(idx,1); else list.push(l);
                                  return { ...p, lifestyle: list };
                                })}
                              >{l}</Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    {type === 'pg' && (
                      <div className="space-y-3">
                        <div>
                          <Label>Name</Label>
                          <Input value={form.name || ''} onChange={e=>setForm((p:any)=>({...p, name:e.target.value}))} />
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea value={form.description || ''} onChange={e=>setForm((p:any)=>({...p, description:e.target.value}))} rows={3} />
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="outline" onClick={cancelEdit} className="flex items-center gap-1"><X size={14} /> Cancel</Button>
                      <Button size="sm" onClick={saveEdit} className="flex items-center gap-1"><Save size={14} /> Save</Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Section title="Rooms" icon={<Home size={18} />} items={data.rooms} type="room" />
      <Section title="Roommates" icon={<Users size={18} />} items={data.flatmates} type="flatmate" />
      <Section title="PGs" icon={<Building size={18} />} items={data.pgs} type="pg" />
    </div>
  );
}
