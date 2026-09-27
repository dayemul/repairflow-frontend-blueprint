import {
  Customer,
  Technician,
  Product,
  Part,
  Repair,
  Invoice,
  Warranty,
  ShopSettings,
  User,
  Payment,
  RepairStatus,
  Estimate,
  Diagnosis,
  QCInspection,
} from '@/types';
import {
  INITIAL_CUSTOMERS,
  INITIAL_INVOICES,
  INITIAL_PARTS,
  INITIAL_PRODUCTS,
  INITIAL_REPAIRS,
  INITIAL_SETTINGS,
  INITIAL_TECHNICIANS,
  INITIAL_USERS,
  INITIAL_WARRANTIES,
} from '@/services/mockData';

const STORAGE_KEYS = {
  USERS: 'fixflow_users',
  ACTIVE_USER: 'fixflow_active_user',
  CUSTOMERS: 'fixflow_customers',
  TECHNICIANS: 'fixflow_technicians',
  PRODUCTS: 'fixflow_products',
  PARTS: 'fixflow_parts',
  REPAIRS: 'fixflow_repairs',
  INVOICES: 'fixflow_invoices',
  WARRANTIES: 'fixflow_warranties',
  SETTINGS: 'fixflow_settings',
};

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.error(e);
    }
  });
}

export function subscribeStorage(fn: Listener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function getItem<T>(key: string, defaultValue: T): T {
  try {
    const val = localStorage.getItem(key);
    if (!val) return defaultValue;
    return JSON.parse(val);
  } catch {
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    notify();
  } catch (e) {
    console.error(`Failed to save ${key}`, e);
  }
}

// Initialize storage on first run
export function initializeStorage(): void {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ACTIVE_USER)) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(INITIAL_USERS[0]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TECHNICIANS)) {
    localStorage.setItem(STORAGE_KEYS.TECHNICIANS, JSON.stringify(INITIAL_TECHNICIANS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PARTS)) {
    localStorage.setItem(STORAGE_KEYS.PARTS, JSON.stringify(INITIAL_PARTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.REPAIRS)) {
    localStorage.setItem(STORAGE_KEYS.REPAIRS, JSON.stringify(INITIAL_REPAIRS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.INVOICES)) {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(INITIAL_INVOICES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.WARRANTIES)) {
    localStorage.setItem(STORAGE_KEYS.WARRANTIES, JSON.stringify(INITIAL_WARRANTIES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
  }
}

// Reset sample data
export function resetStorage(): void {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(INITIAL_USERS[0]));
  localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
  localStorage.setItem(STORAGE_KEYS.TECHNICIANS, JSON.stringify(INITIAL_TECHNICIANS));
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  localStorage.setItem(STORAGE_KEYS.PARTS, JSON.stringify(INITIAL_PARTS));
  localStorage.setItem(STORAGE_KEYS.REPAIRS, JSON.stringify(INITIAL_REPAIRS));
  localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(INITIAL_INVOICES));
  localStorage.setItem(STORAGE_KEYS.WARRANTIES, JSON.stringify(INITIAL_WARRANTIES));
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
  notify();
}

// Data accessors
export const storageService = {
  // Auth & Users
  getUsers: (): User[] => getItem(STORAGE_KEYS.USERS, INITIAL_USERS),
  getActiveUser: (): User => getItem(STORAGE_KEYS.ACTIVE_USER, INITIAL_USERS[0]),
  setActiveUser: (user: User) => setItem(STORAGE_KEYS.ACTIVE_USER, user),

  // Customers
  getCustomers: (): Customer[] => getItem(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS),
  getCustomerById: (id: string): Customer | undefined =>
    storageService.getCustomers().find((c) => c.id === id || c.code === id),
  saveCustomer: (customer: Customer) => {
    const list = storageService.getCustomers();
    const index = list.findIndex((c) => c.id === customer.id);
    if (index >= 0) {
      list[index] = customer;
    } else {
      list.unshift(customer);
    }
    setItem(STORAGE_KEYS.CUSTOMERS, list);
  },
  deleteCustomer: (id: string) => {
    const list = storageService.getCustomers().filter((c) => c.id !== id);
    setItem(STORAGE_KEYS.CUSTOMERS, list);
  },

  // Technicians
  getTechnicians: (): Technician[] => getItem(STORAGE_KEYS.TECHNICIANS, INITIAL_TECHNICIANS),
  getTechnicianById: (id: string): Technician | undefined =>
    storageService.getTechnicians().find((t) => t.id === id),
  saveTechnician: (tech: Technician) => {
    const list = storageService.getTechnicians();
    const index = list.findIndex((t) => t.id === tech.id);
    if (index >= 0) {
      list[index] = tech;
    } else {
      list.push(tech);
    }
    setItem(STORAGE_KEYS.TECHNICIANS, list);
  },

  // Products
  getProducts: (): Product[] => getItem(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS),
  saveProduct: (prod: Product) => {
    const list = storageService.getProducts();
    const index = list.findIndex((p) => p.id === prod.id);
    if (index >= 0) {
      list[index] = prod;
    } else {
      list.unshift(prod);
    }
    setItem(STORAGE_KEYS.PRODUCTS, list);
  },
  deleteProduct: (id: string) => {
    const list = storageService.getProducts().filter((p) => p.id !== id);
    setItem(STORAGE_KEYS.PRODUCTS, list);
  },

  // Parts
  getParts: (): Part[] => getItem(STORAGE_KEYS.PARTS, INITIAL_PARTS),
  getPartById: (id: string): Part | undefined =>
    storageService.getParts().find((p) => p.id === id),
  savePart: (part: Part) => {
    const list = storageService.getParts();
    const index = list.findIndex((p) => p.id === part.id);
    if (index >= 0) {
      list[index] = part;
    } else {
      list.unshift(part);
    }
    setItem(STORAGE_KEYS.PARTS, list);
  },
  adjustPartStock: (partId: string, quantityDelta: number) => {
    const list = storageService.getParts();
    const part = list.find((p) => p.id === partId);
    if (part) {
      part.quantityInStock = Math.max(0, part.quantityInStock + quantityDelta);
      setItem(STORAGE_KEYS.PARTS, list);
    }
  },

  // Repairs
  getRepairs: (): Repair[] => getItem(STORAGE_KEYS.REPAIRS, INITIAL_REPAIRS),
  getRepairById: (id: string): Repair | undefined =>
    storageService.getRepairs().find((r) => r.id === id || r.ticketNumber === id),
  saveRepair: (repair: Repair) => {
    const list = storageService.getRepairs();
    const index = list.findIndex((r) => r.id === repair.id);
    if (index >= 0) {
      list[index] = repair;
    } else {
      list.unshift(repair);
    }
    setItem(STORAGE_KEYS.REPAIRS, list);
  },
  updateRepairStatus: (
    repairId: string,
    newStatus: RepairStatus,
    notes: string,
    user: User
  ) => {
    const list = storageService.getRepairs();
    const repair = list.find((r) => r.id === repairId);
    if (repair) {
      repair.status = newStatus;
      if (newStatus === 'DELIVERED') {
        repair.completedAt = new Date().toISOString();
      }
      repair.timeline.push({
        id: `tl-${Date.now()}`,
        status: newStatus,
        title: `Status changed to ${newStatus.replace(/_/g, ' ')}`,
        description: notes || `Updated by ${user.name} (${user.role})`,
        timestamp: new Date().toISOString(),
        userName: user.name,
        userRole: user.role,
      });
      setItem(STORAGE_KEYS.REPAIRS, list);
    }
  },
  assignTechnician: (repairId: string, tech: Technician, user: User) => {
    const list = storageService.getRepairs();
    const repair = list.find((r) => r.id === repairId);
    if (repair) {
      repair.assignedTechnicianId = tech.id;
      repair.assignedTechnicianName = tech.name;
      repair.timeline.push({
        id: `tl-${Date.now()}`,
        status: repair.status,
        title: `Assigned to ${tech.name}`,
        description: `Technician assigned by ${user.name}`,
        timestamp: new Date().toISOString(),
        userName: user.name,
        userRole: user.role,
      });
      setItem(STORAGE_KEYS.REPAIRS, list);
    }
  },

  // Invoices & Payments
  getInvoices: (): Invoice[] => getItem(STORAGE_KEYS.INVOICES, INITIAL_INVOICES),
  getInvoiceById: (id: string): Invoice | undefined =>
    storageService.getInvoices().find((i) => i.id === id || i.invoiceNumber === id),
  saveInvoice: (invoice: Invoice) => {
    const list = storageService.getInvoices();
    const index = list.findIndex((i) => i.id === invoice.id);
    if (index >= 0) {
      list[index] = invoice;
    } else {
      list.unshift(invoice);
    }
    setItem(STORAGE_KEYS.INVOICES, list);
  },
  addPaymentToInvoice: (invoiceId: string, payment: Payment) => {
    const list = storageService.getInvoices();
    const inv = list.find((i) => i.id === invoiceId);
    if (inv) {
      inv.payments.push(payment);
      inv.amountPaid += payment.amount;
      inv.balanceDue = Math.max(0, inv.total - inv.amountPaid);
      if (inv.balanceDue <= 0) {
        inv.status = 'PAID';
      } else {
        inv.status = 'PARTIALLY_PAID';
      }
      setItem(STORAGE_KEYS.INVOICES, list);
    }
  },

  // Warranties
  getWarranties: (): Warranty[] => getItem(STORAGE_KEYS.WARRANTIES, INITIAL_WARRANTIES),
  getWarrantyByCode: (code: string): Warranty | undefined => {
    const trimmed = code.trim().toLowerCase();
    return storageService
      .getWarranties()
      .find(
        (w) =>
          w.warrantyCode.toLowerCase() === trimmed ||
          w.imeiOrSerial.toLowerCase() === trimmed
      );
  },
  saveWarranty: (warranty: Warranty) => {
    const list = storageService.getWarranties();
    const index = list.findIndex((w) => w.id === warranty.id);
    if (index >= 0) {
      list[index] = warranty;
    } else {
      list.unshift(warranty);
    }
    setItem(STORAGE_KEYS.WARRANTIES, list);
  },

  // Settings
  getSettings: (): ShopSettings => getItem(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS),
  saveSettings: (settings: ShopSettings) => setItem(STORAGE_KEYS.SETTINGS, settings),
};

// Initialize right away
initializeStorage();
