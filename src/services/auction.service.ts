import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  onSnapshot,
  increment
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';

export interface Asset {
  id?: string;
  title: string;
  description: string;
  category: string;
  condition: 'new' | 'good' | 'fair' | 'poor' | 'scrap';
  images: string[];
  location: {
    country: string;
    city: string;
  };
  valuation: {
    estimatedValue: number;
    currency: string;
  };
  sellerId: string;
  sellerName: string;
  status: 'draft' | 'active' | 'sold' | 'removed';
  createdAt: any;
}

export interface Auction {
  id?: string;
  assetId: string;
  asset: Asset;
  sellerId: string;
  auctionType: 'timed' | 'live' | 'buy_now';
  startingPrice: number;
  currentPrice: number;
  reservePrice?: number;
  startTime: Date;
  endTime: Date;
  status: 'scheduled' | 'active' | 'ended' | 'cancelled';
  bids: number;
  createdAt: any;
}

export interface Bid {
  id?: string;
  auctionId: string;
  bidderId: string;
  bidderName: string;
  amount: number;
  timestamp: any;
  isWinning?: boolean;
}

export const auctionService = {
  // Create new auction
  async createAuction(auctionData: Partial<Auction>): Promise<Auction> {
    const auctionRef = await addDoc(collection(db, 'auctions'), {
      ...auctionData,
      currentPrice: auctionData.startingPrice,
      bids: 0,
      status: 'scheduled',
      createdAt: serverTimestamp()
    });
    
    const auctionDoc = await getDoc(auctionRef);
    return { id: auctionDoc.id, ...auctionDoc.data() } as Auction;
  },

  // Get all active auctions
  async getActiveAuctions(): Promise<Auction[]> {
    const q = query(
      collection(db, 'auctions'),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Auction));
  },

  // Subscribe to real-time auction updates
  subscribeToAuction(auctionId: string, callback: (auction: Auction) => void) {
    return onSnapshot(doc(db, 'auctions', auctionId), (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() } as Auction);
      }
    });
  },

  // Place bid
  async placeBid(bidData: Omit<Bid, 'id' | 'timestamp'>): Promise<Bid> {
    const bidRef = await addDoc(collection(db, 'bids'), {
      ...bidData,
      timestamp: serverTimestamp()
    });
    
    // Update auction current price and bid count
    const auctionRef = doc(db, 'auctions', bidData.auctionId);
    await updateDoc(auctionRef, {
      currentPrice: bidData.amount,
      bids: increment(1)
    });
    
    const bidDoc = await getDoc(bidRef);
    return { id: bidDoc.id, ...bidDoc.data() } as Bid;
  },

  // Subscribe to real-time bids
  subscribeToBids(auctionId: string, callback: (bids: Bid[]) => void) {
    const q = query(
      collection(db, 'bids'),
      where('auctionId', '==', auctionId),
      orderBy('timestamp', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const bids = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Bid));
      callback(bids);
    });
  }
};
