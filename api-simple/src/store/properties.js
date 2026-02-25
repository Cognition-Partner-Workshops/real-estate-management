import { v4 as uuidv4 } from "uuid";

/**
 * In-memory store for properties with seed data.
 */
const properties = [
  {
    id: uuidv4(),
    name: "Sunset Villa",
    address: "123 Ocean Drive, Miami, FL 33139",
    description: "A luxurious beachfront villa with stunning sunset views and modern amenities.",
    type: "residential",
    transactionType: "sale",
    price: 1250000,
    currency: "USD",
    features: ["pool", "garage", "ocean view", "smart home"],
    contactEmail: "agent@sunsetvilla.com",
    contactNumber: "+1-305-555-0101",
    position: { lat: 25.7617, lng: -80.1918 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: "Downtown Office Space",
    address: "456 Business Ave, New York, NY 10001",
    description: "Modern office space in the heart of Manhattan with floor-to-ceiling windows.",
    type: "commercial",
    transactionType: "rent",
    price: 8500,
    paymentFrequency: "monthly",
    currency: "USD",
    features: ["elevator", "parking", "conference rooms", "fiber internet"],
    contactEmail: "leasing@downtownoffice.com",
    contactNumber: "+1-212-555-0202",
    position: { lat: 40.7484, lng: -73.9967 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: "Green Acres Land",
    address: "789 Country Road, Austin, TX 78701",
    description: "Spacious undeveloped land perfect for building your dream home or farm.",
    type: "land",
    transactionType: "sale",
    price: 350000,
    currency: "USD",
    features: ["water access", "road frontage", "flat terrain"],
    contactEmail: "sales@greenacres.com",
    contactNumber: "+1-512-555-0303",
    position: { lat: 30.2672, lng: -97.7431 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function getAllProperties({ type, transactionType, minPrice, maxPrice }) {
  let result = [...properties];

  if (type) {
    result = result.filter((p) => p.type === type);
  }
  if (transactionType) {
    result = result.filter((p) => p.transactionType === transactionType);
  }
  if (minPrice !== undefined) {
    result = result.filter((p) => p.price >= minPrice);
  }
  if (maxPrice !== undefined) {
    result = result.filter((p) => p.price <= maxPrice);
  }

  return result;
}

export function getPropertyById(id) {
  return properties.find((p) => p.id === id) || null;
}

export function createProperty(data) {
  const now = new Date().toISOString();
  const property = {
    id: uuidv4(),
    name: data.name,
    address: data.address,
    description: data.description || "",
    type: data.type,
    transactionType: data.transactionType,
    price: data.price || 0,
    paymentFrequency: data.paymentFrequency || null,
    currency: data.currency || "USD",
    features: data.features || [],
    contactEmail: data.contactEmail || "",
    contactNumber: data.contactNumber || "",
    position: data.position || { lat: 0, lng: 0 },
    createdAt: now,
    updatedAt: now,
  };
  properties.push(property);
  return property;
}

export function updateProperty(id, data) {
  const index = properties.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const existing = properties[index];
  const updated = {
    ...existing,
    ...data,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  };
  properties[index] = updated;
  return updated;
}

export function deleteProperty(id) {
  const index = properties.findIndex((p) => p.id === id);
  if (index === -1) return false;
  properties.splice(index, 1);
  return true;
}
