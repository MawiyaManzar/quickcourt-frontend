import { useEffect, useState, type SyntheticEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ownerService } from './services/ownerService';
import type { SportType } from '../../types';
import styles from './OwnerFacilityFormPage.module.css';

const AVAILABLE_SPORTS: SportType[] = [
  'BADMINTON',
  'TENNIS',
  'FOOTBALL',
  'CRICKET',
  'BASKETBALL',
  'TABLE_TENNIS',
  'SWIMMING',
  'SQUASH',
];

const AVAILABLE_AMENITIES = [
  'Parking',
  'Changing Rooms',
  'Showers',
  'Cafeteria',
  'First Aid',
  'WiFi',
  'Floodlights',
  'Equipment Rental',
  'CCTV Security',
];

export default function OwnerFacilityFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [isLoading, setIsLoading] = useState<boolean>(isEdit);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [name, setName] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [selectedSports, setSelectedSports] = useState<SportType[]>(['BADMINTON']);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(['Parking', 'WiFi']);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [images, setImages] = useState<string[]>([]);
  const [contactPhone, setContactPhone] = useState<string>('');
  const [contactEmail, setContactEmail] = useState<string>('');

  useEffect(() => {
    if (id) {
      ownerService.getFacilityById(id).then((fac) => {
        if (fac) {
          setName(fac.name);
          setLocation(fac.location);
          setAddress(fac.address);
          setDescription(fac.description);
          setSelectedSports(fac.sports || []);
          setSelectedAmenities(fac.amenities || []);
          setImages(fac.images || []);
        }
        setIsLoading(false);
      });
    }
  }, [id]);

  const toggleSport = (sport: SportType) => {
    if (selectedSports.includes(sport)) {
      if (selectedSports.length === 1) {
        toast.error('Select at least one sport');
        return;
      }
      setSelectedSports(selectedSports.filter((s) => s !== sport));
    } else {
      setSelectedSports([...selectedSports, sport]);
    }
  };

  const toggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const handleAddImage = () => {
    if (!imageUrl.trim()) return;
    setImages([...images, imageUrl.trim()]);
    setImageUrl('');
  };

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    if (!name.trim() || !location.trim() || !address.trim() || !description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        location: location.trim(),
        address: address.trim(),
        description: description.trim(),
        sports: selectedSports,
        amenities: selectedAmenities,
        images:
          images.length > 0
            ? images
            : [
                'https://images.unsplash.com/photo-1626225967045-9440882269ab?auto=format&fit=crop&w=600&q=80',
              ],
        contactPhone,
        contactEmail,
      };

      if (isEdit && id) {
        await ownerService.updateFacility(id, payload);
        toast.success('Facility updated successfully');
      } else {
        await ownerService.createFacility(payload);
        toast.success('Facility submitted for admin approval!');
      }
      navigate('/owner/facilities');
    } catch {
      toast.error('Failed to save facility');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div style={{ height: 350, background: 'var(--color-surface)', borderRadius: '16px', opacity: 0.6 }} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>{isEdit ? 'Edit Facility' : 'Add New Sports Facility'}</h1>
        <p className={styles.subtitle}>
          {isEdit
            ? 'Update details of your existing sports venue.'
            : 'Fill in venue details to submit your facility for admin review.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.card}>
        <Input
          label="Facility Name *"
          placeholder="e.g. Apex Sports Arena"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          label="City / Location *"
          placeholder="e.g. Gurgaon, Delhi NCR"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Full Address *</label>
          <textarea
            className={styles.textarea}
            placeholder="Complete street address including landmark and pin code"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Description *</label>
          <textarea
            className={styles.textarea}
            placeholder="Tell customers about your court quality, facilities, rules, and parking..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        {/* Sports Multi-Select */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Supported Sports *</label>
          <div className={styles.chipsGrid}>
            {AVAILABLE_SPORTS.map((sport) => {
              const isSelected = selectedSports.includes(sport);
              return (
                <button
                  key={sport}
                  type="button"
                  className={`${styles.chip} ${isSelected ? styles.chipSelected : ''}`}
                  onClick={() => toggleSport(sport)}
                >
                  {isSelected ? '✓ ' : ''}{sport}
                </button>
              );
            })}
          </div>
        </div>

        {/* Amenities Multi-Select */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Available Amenities</label>
          <div className={styles.chipsGrid}>
            {AVAILABLE_AMENITIES.map((amenity) => {
              const isSelected = selectedAmenities.includes(amenity);
              return (
                <button
                  key={amenity}
                  type="button"
                  className={`${styles.chip} ${isSelected ? styles.chipSelected : ''}`}
                  onClick={() => toggleAmenity(amenity)}
                >
                  {isSelected ? '✓ ' : ''}{amenity}
                </button>
              );
            })}
          </div>
        </div>

        {/* Image URLs */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Facility Photos</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Input
              placeholder="Paste photo image URL..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
            <Button type="button" variant="secondary" onClick={handleAddImage}>
              Add Image
            </Button>
          </div>

          {images.length > 0 && (
            <div className={styles.imageRow}>
              {images.map((img, idx) => (
                <img key={idx} src={img} alt="Preview" className={styles.imgPreview} />
              ))}
            </div>
          )}
        </div>

        {/* Contact Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Input
            label="Contact Phone"
            placeholder="+91 98765 43210"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
          />
          <Input
            label="Contact Email"
            placeholder="venue@sports.com"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
          />
        </div>

        <div className={styles.actionsRow}>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/owner/facilities')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEdit ? 'Save Changes' : 'Submit Facility for Approval'}
          </Button>
        </div>
      </form>
    </div>
  );
}
