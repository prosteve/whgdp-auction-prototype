import { useState, useEffect } from 'react';
import { auctionService, Auction, Bid } from '../services/auction.service';

export const useBidding = (auctionId: string) => {
  const [auction, setAuction] = useState<Auction | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auctionId) return;

    // Subscribe to auction updates
    const unsubscribeAuction = auctionService.subscribeToAuction(auctionId, (updatedAuction) => {
      setAuction(updatedAuction);
      setLoading(false);
    });

    // Subscribe to bids
    const unsubscribeBids = auctionService.subscribeToBids(auctionId, (updatedBids) => {
      setBids(updatedBids);
    });

    return () => {
      unsubscribeAuction();
      unsubscribeBids();
    };
  }, [auctionId]);

  const placeBid = async (amount: number, bidderId: string, bidderName: string) => {
    try {
      if (!auction) throw new Error('Auction not found');
      
      // Validate bid
      if (amount <= auction.currentPrice) {
        throw new Error('Bid must be higher than current price');
      }

      // Check if auction is still active
      if (auction.status !== 'active' || new Date() > new Date(auction.endTime)) {
        throw new Error('Auction is not active');
      }

      await auctionService.placeBid({
        auctionId,
        bidderId,
        bidderName,
        amount,
        isWinning: true
      });

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  return {
    auction,
    bids,
    loading,
    error,
    placeBid
  };
};
