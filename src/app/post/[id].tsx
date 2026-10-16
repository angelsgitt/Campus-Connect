import { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  Share,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SymbolView } from 'expo-symbols';

import {
  Cyberwave,
  MarketplaceItem,
  SAMPLE_MARKETPLACE_ITEMS,
  SAMPLE_COMMUNITY_REQUESTS,
} from '@/constants/cyberwave';
import { useCampusStore } from '@/lib/campus-store';

export default function PostDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { submitOffer, sentOffers } = useCampusStore();

  // Look up matching item from mock datasets (marketplace items, runtime posts, or community requests)
  const item: MarketplaceItem | undefined = useMemo(() => {
    if (!id) return undefined;

    // 1. Direct match in SAMPLE_MARKETPLACE_ITEMS (includes runtime session created posts)
    const directMatch = SAMPLE_MARKETPLACE_ITEMS.find((listItem) => listItem.id === id);
    if (directMatch) return directMatch;

    // 2. Lookup in SAMPLE_COMMUNITY_REQUESTS
    const requestMatch = SAMPLE_COMMUNITY_REQUESTS.find(
      (req) => req.id === id || req.linkedPostId === id
    );
    if (requestMatch) {
      if (requestMatch.linkedPostId && requestMatch.linkedPostId !== id) {
        const linkedItem = SAMPLE_MARKETPLACE_ITEMS.find(
          (listItem) => listItem.id === requestMatch.linkedPostId
        );
        if (linkedItem) return linkedItem;
      }

      // Convert community request to full MarketplaceItem view
      return {
        id: requestMatch.id,
        title: requestMatch.title,
        category: (requestMatch.category as any) || 'Study Essentials',
        listingType: 'Borrow',
        price: requestMatch.budget || 'Free Borrow',
        sellerName: requestMatch.requesterName,
        sellerInitials: requestMatch.requesterInitials,
        sellerDepartment: requestMatch.requesterDept,
        postedTime: requestMatch.postedTime,
        description: requestMatch.description,
        location: 'Campus Meetup / Academic Block',
        badgeText: `Needed: ${requestMatch.whenNeeded}`,
        visualType:
          requestMatch.category === 'Books'
            ? 'book'
            : requestMatch.category === 'Electronics'
            ? 'calculator'
            : requestMatch.category === 'Clothing'
            ? 'hoodie'
            : 'lamp',
      };
    }

    return undefined;
  }, [id]);

  // Safely parse numeric price
  const numericPrice = useMemo(() => {
    if (!item?.price) return 0;
    const cleaned = item.price.replace(/[^\d.]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) || parsed < 0 ? 0 : parsed;
  }, [item?.price]);

  // Dynamically compute suggested offer prices
  // e.g. for ₹150 -> ₹135 (0.9x), ₹150 (1.0x), ₹165 (1.1x)
  const suggestedOffers = useMemo(() => {
    if (!item || item.listingType !== 'For sale' || numericPrice <= 0) {
      return [];
    }
    const p1 = Math.max(1, Math.round(numericPrice * 0.9));
    const p2 = Math.round(numericPrice);
    const p3 = Math.round(numericPrice * 1.1);

    const uniqueValues = Array.from(new Set([p1, p2, p3]));
    return uniqueValues.map((val) => `₹${val}`);
  }, [item, numericPrice]);

  // In-app Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Seller Profile Preview Modal
  const [showSellerModal, setShowSellerModal] = useState(false);

  // Make an Offer Modal & Form State
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [offerError, setOfferError] = useState<string | null>(null);
  const [offerSuccess, setOfferSuccess] = useState(false);

  // Sent Offers Modal
  const [showSentOffersModal, setShowSentOffersModal] = useState(false);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/marketplace' as any);
    }
  };

  const handleShare = async () => {
    if (!item) return;
    try {
      const result = await Share.share({
        title: item.title,
        message: `Check out "${item.title}" for ${item.price} on Campus Connect!`,
      });
      if (result.action === Share.sharedAction) {
        showToast('Shared successfully!');
      }
    } catch {
      showToast('Link copied to clipboard!');
    }
  };

  const handleChatWithSeller = () => {
    if (!item) return;
    router.push({
      pathname: '/chat/[id]',
      params: {
        id: item.sellerName,
        name: item.sellerName,
        topic: item.title,
        department: item.sellerDepartment,
      },
    } as any);
  };

  const handleMakeOffer = () => {
    if (!item || item.listingType !== 'For sale' || numericPrice <= 0) return;
    const initialAmount = suggestedOffers[0] || `₹${numericPrice}`;
    setOfferAmount(initialAmount.replace(/[^\d.]/g, ''));
    setOfferMessage('');
    setOfferError(null);
    setOfferSuccess(false);
    setShowOfferModal(true);
  };

  const handleSubmitOffer = () => {
    if (!item) return;
    const clean = offerAmount.replace(/[^\d.]/g, '');
    const num = parseFloat(clean);
    if (isNaN(num) || num <= 0) {
      setOfferError('Please enter a valid offer amount');
      return;
    }

    setOfferError(null);
    submitOffer({
      listingId: item.id,
      listingTitle: item.title,
      sellerName: item.sellerName,
      amount: `₹${num}`,
      message: offerMessage.trim() || undefined,
    });
    setOfferSuccess(true);
  };

  const handleRequestBorrow = () => {
    if (!item) return;
    router.push({
      pathname: '/chat/[id]',
      params: {
        id: item.sellerName,
        name: item.sellerName,
        topic: `Borrow Request: ${item.title}`,
        department: item.sellerDepartment,
      },
    } as any);
  };

  const handleContactStudent = () => {
    if (!item) return;
    router.push({
      pathname: '/chat/[id]',
      params: {
        id: item.sellerName,
        name: item.sellerName,
        topic: `Inquiry: ${item.title}`,
        department: item.sellerDepartment,
      },
    } as any);
  };

  // If item is not found, show friendly fallback
  if (!item) {
    return (
      <View style={styles.screenContainer}>
        <StatusBar style="light" />

        {/* Fallback Header */}
        <View
          style={[
            styles.headerContainer,
            { paddingTop: Math.max(insets.top, 20) + 8 },
          ]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to Marketplace"
            onPress={handleBack}
            style={styles.backButton}>
            <Text style={styles.backButtonArrow}>←</Text>
            <Text style={styles.backButtonText}>Marketplace</Text>
          </Pressable>
        </View>

        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundEmoji}>🔍</Text>
          <Text style={styles.notFoundTitle}>Listing not found</Text>
          <Text style={styles.notFoundText}>
            This campus listing may have already been sold, claimed, or removed by
            the student.
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Return to Marketplace"
            onPress={() => router.push('/marketplace' as any)}
            style={styles.notFoundButton}>
            <Text style={styles.notFoundButtonText}>Back to Marketplace</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Calculate bottom action bar height for scroll content padding
  const bottomActionHeight = 72 + Math.max(insets.bottom, 16);

  return (
    <View style={styles.screenContainer}>
      <StatusBar style="light" />

      {/* In-app Toast Banner */}
      {toastMessage && (
        <View style={[styles.toastContainer, { top: Math.max(insets.top, 16) + 8 }]}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* HEADER SECTION (ELECTRIC BLUE WITH BACK & SHARE) */}
      <View
        style={[
          styles.headerContainer,
          { paddingTop: Math.max(insets.top, 20) + 8 },
        ]}>
        {/* Subtle background glow circle */}
        <View style={styles.headerGlowCircle} />

        <View style={styles.headerTopBar}>
          {/* Back button with "Marketplace" text */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to Marketplace"
            onPress={handleBack}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressedOpacity,
            ]}>
            <Text style={styles.backButtonArrow}>←</Text>
            <Text style={styles.backButtonText}>Marketplace</Text>
          </Pressable>

          <View style={styles.headerActionsGroup}>
            {/* Sent Offers Button */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="View sent offers"
              onPress={() => setShowSentOffersModal(true)}
              style={({ pressed }) => [
                styles.headerOffersButton,
                pressed && styles.pressedOpacity,
              ]}>
              <Text style={styles.headerOffersButtonEmoji}>🏷️</Text>
              <Text style={styles.headerOffersButtonText}>Offers</Text>
              {sentOffers.length > 0 && (
                <View style={styles.headerOffersBadge}>
                  <Text style={styles.headerOffersBadgeText}>{sentOffers.length}</Text>
                </View>
              )}
            </Pressable>

            {/* Share button on the right */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Share this listing"
              onPress={handleShare}
              style={({ pressed }) => [
                styles.shareButton,
                pressed && styles.pressedOpacity,
              ]}>
              <SymbolView
                name={{
                  ios: 'square.and.arrow.up',
                  android: 'share',
                  web: 'share',
                }}
                size={18}
                tintColor={Cyberwave.white}
                fallback={<Text style={styles.shareFallbackText}>↗</Text>}
              />
            </Pressable>
          </View>
        </View>
      </View>

      {/* MAIN SCROLLABLE CONTENT */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottomActionHeight + 20 },
        ]}
        showsVerticalScrollIndicator={false}>
        {/* PROMINENT PRODUCT IMAGE / VISUAL BANNER */}
        <View style={styles.heroVisualWrapper}>
          <DetailVisualHero
            visualType={item.visualType}
            badgeText={item.badgeText}
            title={item.title}
          />

          {/* Listing Type Tag Badge (For Sale / Borrow / Lend) */}
          <View
            style={[
              styles.heroTypeBadge,
              item.listingType === 'For sale' && styles.typeBadgeSale,
              item.listingType === 'Borrow' && styles.typeBadgeBorrow,
              item.listingType === 'Lend' && styles.typeBadgeLend,
            ]}>
            <Text
              style={[
                styles.heroTypeBadgeText,
                item.listingType === 'For sale' && styles.typeTextSale,
                item.listingType === 'Borrow' && styles.typeTextBorrow,
                item.listingType === 'Lend' && styles.typeTextLend,
              ]}>
              {item.listingType === 'For sale' ? 'For Sale' : item.listingType}
            </Text>
          </View>
        </View>

        {/* ITEM INFORMATION CARD */}
        <View style={styles.cardContainer}>
          {/* Category & Condition Row */}
          <View style={styles.tagRow}>
            <View style={styles.categoryPill}>
              <Text style={styles.categoryPillText}>{item.category}</Text>
            </View>
            {item.condition && (
              <View style={styles.conditionPill}>
                <Text style={styles.conditionPillText}>{item.condition}</Text>
              </View>
            )}
            <Text style={styles.postedTimeText}>{item.postedTime}</Text>
          </View>

          {/* Title */}
          <Text style={styles.itemTitle}>{item.title}</Text>

          {/* Price Row */}
          <View style={styles.priceRow}>
            <Text
              style={[
                styles.priceText,
                item.price === 'Free' && styles.priceFreeText,
              ]}>
              {item.price}
            </Text>
            {/* Show original price only if listing data contains one */}
            {item.originalPrice && item.price !== 'Free' && (
              <View style={styles.originalPriceWrap}>
                <Text style={styles.originalPriceText}>
                  MRP {item.originalPrice}
                </Text>
                <View style={styles.savingsPill}>
                  <Text style={styles.savingsPillText}>Campus Deal</Text>
                </View>
              </View>
            )}
          </View>

          {/* Divider */}
          <View style={styles.cardDivider} />

          {/* Description Section */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionHeading}>Description</Text>
            <Text style={styles.descriptionText}>{item.description}</Text>
          </View>

          {/* Lending / Availability Notes */}
          {item.badgeText && (
            <View style={styles.availabilityNoteBox}>
              <Text style={styles.availabilityNoteIcon}>ℹ️</Text>
              <Text style={styles.availabilityNoteText}>
                {item.badgeText} · Available immediately on campus
              </Text>
            </View>
          )}
        </View>

        {/* SELLER INFORMATION CARD - CLICKABLE TO STUDENT PROFILE */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Seller profile: ${item.sellerName}`}
          onPress={() =>
            router.push(`/student/${encodeURIComponent(item.sellerName)}` as any)
          }
          style={({ pressed }) => [
            styles.cardContainer,
            styles.sellerCardPressable,
            pressed && styles.pressedCardOpacity,
          ]}>
          <View style={styles.sellerHeaderRow}>
            <Text style={styles.sectionHeading}>Seller Details</Text>
            <Text style={styles.sellerViewProfileHint}>View Profile ›</Text>
          </View>
          <View style={styles.sellerRow}>
            <View style={styles.sellerAvatarCircle}>
              <Text style={styles.sellerAvatarInitials}>
                {item.sellerInitials}
              </Text>
            </View>
            <View style={styles.sellerInfoCol}>
              <View style={styles.sellerNameBadgeRow}>
                <Text style={styles.sellerName}>{item.sellerName}</Text>
                {/* Verified indicator */}
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedBadgeText}>✓ Verified</Text>
                </View>
              </View>
              <Text style={styles.sellerDepartment}>
                {item.sellerDepartment}
              </Text>
            </View>
            <Text style={styles.sellerChevron}>›</Text>
          </View>
        </Pressable>

        {/* CAMPUS MEETUP INFORMATION CARD */}
        <View style={styles.cardContainer}>
          <View style={styles.meetupHeaderRow}>
            <Text style={styles.meetupLocationIcon}>📍</Text>
            <View>
              <Text style={styles.sectionHeading}>Campus Meetup</Text>
              <Text style={styles.meetupLocationTitle}>{item.location}</Text>
            </View>
          </View>
          <View style={styles.meetupNoteBox}>
            <Text style={styles.meetupNoteText}>
              🤝 Buyer and seller can easily coordinate and agree on a convenient,
              safe campus spot like the central library foyer, canteen, or
              student center.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* BOTTOM ACTIONS BAR */}
      <View
        style={[
          styles.bottomActionsContainer,
          {
            paddingBottom: Math.max(insets.bottom, 16),
            height: bottomActionHeight,
          },
        ]}>
        {/* For-sale listing with price: Primary "Chat with Seller", Secondary "Make an Offer" */}
        {item.listingType === 'For sale' && numericPrice > 0 && (
          <View style={styles.actionsRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Make an offer"
              onPress={handleMakeOffer}
              style={({ pressed }) => [
                styles.secondaryActionButton,
                pressed && styles.pressedOpacity,
              ]}>
              <Text style={styles.secondaryActionText}>Make an Offer</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Chat with Seller"
              onPress={handleChatWithSeller}
              style={({ pressed }) => [
                styles.primaryActionButton,
                pressed && styles.pressedOpacity,
              ]}>
              <Text style={styles.primaryActionText}>Chat with Seller</Text>
            </Pressable>
          </View>
        )}

        {/* For-sale listing with Free/₹0: Primary "Chat with Seller" */}
        {item.listingType === 'For sale' && numericPrice <= 0 && (
          <View style={styles.actionsRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Chat with Seller"
              onPress={handleChatWithSeller}
              style={({ pressed }) => [
                styles.primaryActionButton,
                pressed && styles.pressedOpacity,
              ]}>
              <Text style={styles.primaryActionText}>Chat with Seller</Text>
            </Pressable>
          </View>
        )}

        {/* Lend listing: Primary "Request to Borrow" */}
        {item.listingType === 'Lend' && (
          <View style={styles.actionsRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Request to Borrow"
              onPress={handleRequestBorrow}
              style={({ pressed }) => [
                styles.primaryActionButton,
                pressed && styles.pressedOpacity,
              ]}>
              <Text style={styles.primaryActionText}>Request to Borrow</Text>
            </Pressable>
          </View>
        )}

        {/* Borrow listing: Primary "Contact Student" */}
        {item.listingType === 'Borrow' && (
          <View style={styles.actionsRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Contact Student"
              onPress={handleContactStudent}
              style={({ pressed }) => [
                styles.primaryActionButton,
                styles.cyanActionButton,
                pressed && styles.pressedOpacity,
              ]}>
              <Text style={styles.primaryActionText}>Contact Student</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* SELLER PROFILE PREVIEW MODAL */}
      <Modal
        visible={showSellerModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowSellerModal(false)}>
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setShowSellerModal(false)}
          />
          <View style={styles.sellerPreviewCard}>
            <View style={styles.sellerModalAvatar}>
              <Text style={styles.sellerModalAvatarText}>
                {item.sellerInitials}
              </Text>
            </View>
            <Text style={styles.sellerModalName}>{item.sellerName}</Text>
            <Text style={styles.sellerModalDept}>{item.sellerDepartment}</Text>

            <View style={styles.sellerStatsRow}>
              <View style={styles.sellerStatItem}>
                <Text style={styles.sellerStatNumber}>100%</Text>
                <Text style={styles.sellerStatLabel}>Response</Text>
              </View>
              <View style={styles.sellerStatDivider} />
              <View style={styles.sellerStatItem}>
                <Text style={styles.sellerStatNumber}>Verified</Text>
                <Text style={styles.sellerStatLabel}>Campus ID</Text>
              </View>
              <View style={styles.sellerStatDivider} />
              <View style={styles.sellerStatItem}>
                <Text style={styles.sellerStatNumber}>Active</Text>
                <Text style={styles.sellerStatLabel}>On Campus</Text>
              </View>
            </View>

            <Pressable
              onPress={() => setShowSellerModal(false)}
              style={styles.closeModalButton}>
              <Text style={styles.closeModalButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* MAKE AN OFFER MODAL */}
      <Modal
        visible={showOfferModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowOfferModal(false)}>
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setShowOfferModal(false)}
          />
          <View
            style={[
              styles.offerModalSheet,
              { paddingBottom: Math.max(insets.bottom, 16) + 16 },
            ]}>
            {offerSuccess ? (
              <View style={styles.offerSuccessContainer}>
                <View style={styles.offerSuccessIconCircle}>
                  <Text style={styles.offerSuccessCheckEmoji}>✓</Text>
                </View>
                <Text style={styles.offerSuccessTitle}>Offer Submitted!</Text>
                <Text style={styles.offerSuccessSubtitle}>
                  Your offer of {offerAmount.startsWith('₹') ? offerAmount : `₹${offerAmount}`} has been sent to {item.sellerName}.
                </Text>

                <View style={styles.offerSuccessDetailCard}>
                  <Text style={styles.offerSuccessItemTitle}>{item.title}</Text>
                  <Text style={styles.offerSuccessMeta}>
                    Status: <Text style={styles.offerSuccessStatusText}>Pending Seller Review</Text>
                  </Text>
                  {offerMessage ? (
                    <Text style={styles.offerSuccessMsg}>&quot;{offerMessage}&quot;</Text>
                  ) : null}
                </View>

                <View style={styles.modalActionButtonsRow}>
                  <Pressable
                    onPress={() => {
                      setShowOfferModal(false);
                      setShowSentOffersModal(true);
                    }}
                    style={styles.viewOffersActionButton}>
                    <Text style={styles.viewOffersActionText}>
                      View Sent Offers ({sentOffers.length})
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setShowOfferModal(false)}
                    style={styles.doneOfferButton}>
                    <Text style={styles.doneOfferButtonText}>Done</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <>
                <Text style={styles.offerModalTitle}>Make an Offer</Text>
                <Text style={styles.offerModalSubtitle}>
                  Listed price: {item.price}. Propose a fair student price.
                </Text>

                {/* Quick Suggested Price Pills */}
                <View style={styles.offerPillOptionsRow}>
                  {suggestedOffers.map((suggestedPrice) => (
                    <Pressable
                      key={suggestedPrice}
                      onPress={() => {
                        setOfferAmount(suggestedPrice.replace(/[^\d.]/g, ''));
                        setOfferError(null);
                      }}
                      style={[
                        styles.suggestedOfferPill,
                        offerAmount === suggestedPrice.replace(/[^\d.]/g, '') &&
                          styles.suggestedOfferPillActive,
                      ]}>
                      <Text
                        style={[
                          styles.suggestedOfferText,
                          offerAmount === suggestedPrice.replace(/[^\d.]/g, '') &&
                            styles.suggestedOfferTextActive,
                        ]}>
                        {suggestedPrice}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {/* Custom Amount Input */}
                <View style={styles.offerFieldGroup}>
                  <Text style={styles.offerFieldLabel}>Offer Amount (₹)</Text>
                  <View style={styles.offerAmountInputWrap}>
                    <Text style={styles.offerRupeePrefix}>₹</Text>
                    <TextInput
                      style={styles.offerAmountInput}
                      placeholder="Enter amount"
                      placeholderTextColor="#94A3B8"
                      keyboardType="numeric"
                      value={offerAmount}
                      onChangeText={(val) => {
                        setOfferAmount(val);
                        if (offerError) setOfferError(null);
                      }}
                    />
                  </View>
                </View>

                {/* Optional Message Input */}
                <View style={styles.offerFieldGroup}>
                  <Text style={styles.offerFieldLabel}>Optional Note to Seller</Text>
                  <TextInput
                    style={styles.offerNoteInput}
                    placeholder="e.g. Can meet today at library foyer"
                    placeholderTextColor="#94A3B8"
                    value={offerMessage}
                    onChangeText={setOfferMessage}
                    multiline
                    numberOfLines={2}
                  />
                </View>

                {offerError && (
                  <Text style={styles.offerErrorText}>⚠️ {offerError}</Text>
                )}

                <View style={styles.modalActionButtonsRow}>
                  <Pressable
                    onPress={() => setShowOfferModal(false)}
                    style={styles.cancelOfferButton}>
                    <Text style={styles.cancelOfferButtonText}>Cancel</Text>
                  </Pressable>

                  <Pressable
                    onPress={handleSubmitOffer}
                    style={styles.submitOfferButton}>
                    <Text style={styles.submitOfferButtonText}>Send Offer</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* SENT OFFERS DESTINATION MODAL */}
      <Modal
        visible={showSentOffersModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowSentOffersModal(false)}>
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setShowSentOffersModal(false)}
          />
          <View
            style={[
              styles.sentOffersModalSheet,
              { paddingBottom: Math.max(insets.bottom, 16) + 16 },
            ]}>
            <View style={styles.sentOffersHeaderRow}>
              <View>
                <Text style={styles.offerModalTitle}>My Sent Offers</Text>
                <Text style={styles.offerModalSubtitle}>
                  Review your active offers to campus sellers
                </Text>
              </View>
              <Pressable
                onPress={() => setShowSentOffersModal(false)}
                style={styles.closeRoundButton}>
                <Text style={styles.closeRoundButtonText}>✕</Text>
              </Pressable>
            </View>

            <ScrollView
              style={styles.sentOffersScrollView}
              showsVerticalScrollIndicator={false}>
              {sentOffers.length > 0 ? (
                sentOffers.map((offer) => (
                  <View key={offer.id} style={styles.sentOfferItemCard}>
                    <View style={styles.sentOfferTopLine}>
                      <Text style={styles.sentOfferItemTitle} numberOfLines={1}>
                        {offer.listingTitle}
                      </Text>
                      <View style={styles.sentOfferStatusBadge}>
                        <Text style={styles.sentOfferStatusText}>{offer.status}</Text>
                      </View>
                    </View>
                    <View style={styles.sentOfferMetaRow}>
                      <Text style={styles.sentOfferAmountText}>{offer.amount}</Text>
                      <Text style={styles.sentOfferSellerText}>
                        Seller: {offer.sellerName}
                      </Text>
                      <Text style={styles.sentOfferTimeText}>{offer.timestamp}</Text>
                    </View>
                    {offer.message ? (
                      <Text style={styles.sentOfferNoteText}>
                        &quot;{offer.message}&quot;
                      </Text>
                    ) : null}
                  </View>
                ))
              ) : (
                <View style={styles.sentOffersEmptyState}>
                  <Text style={styles.sentOffersEmptyEmoji}>🏷️</Text>
                  <Text style={styles.sentOffersEmptyTitle}>No offers sent yet</Text>
                  <Text style={styles.sentOffersEmptySub}>
                    You can submit fair price offers on any &quot;For sale&quot; item.
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ----------------------------------------------------
// HERO PRODUCT VISUAL COMPONENT
// ----------------------------------------------------
function DetailVisualHero({
  visualType,
  badgeText,
  title,
}: {
  visualType: MarketplaceItem['visualType'];
  badgeText?: string;
  title: string;
}) {
  switch (visualType) {
    case 'book':
      return (
        <View style={[styles.heroBox, { backgroundColor: '#0F172A' }]}>
          <View style={styles.bookHeroSpine} />
          <View style={styles.bookHeroContent}>
            <Text style={styles.bookHeroSub}>B.TECH CURRICULUM · REVISED</Text>
            <Text style={styles.bookHeroMain}>HIGHER ENGINEERING</Text>
            <Text style={styles.bookHeroMathWord}>MATHEMATICS</Text>
            <Text style={styles.bookHeroFormula}>
              ∫ e^x cos(x) dx · ∇²u = 0 · λ₁ ≠ λ₂
            </Text>
            {badgeText && (
              <View style={styles.heroMiniBadge}>
                <Text style={styles.heroMiniBadgeText}>{badgeText}</Text>
              </View>
            )}
          </View>
        </View>
      );
    case 'calculator':
      return (
        <View style={[styles.heroBox, { backgroundColor: '#1E293B' }]}>
          <View style={styles.calcScreenBox}>
            <Text style={styles.calcScreenTitle}>CASIO ClassWiz fx-991EX</Text>
            <Text style={styles.calcScreenFormula}>552 FUNCTIONS · SOLAR CELL</Text>
          </View>
          <View style={styles.calcKeypadGrid}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <View key={i} style={styles.calcKey} />
            ))}
          </View>
          {badgeText && (
            <View style={styles.heroMiniBadge}>
              <Text style={styles.heroMiniBadgeText}>{badgeText}</Text>
            </View>
          )}
        </View>
      );
    case 'labcoat':
      return (
        <View style={[styles.heroBox, { backgroundColor: '#334155' }]}>
          <Text style={styles.heroBigEmoji}>🥼</Text>
          <Text style={styles.heroGraphicTitle}>CHEMISTRY LAB COAT</Text>
          <Text style={styles.heroGraphicSub}>100% PURE HEAVY COTTON · SIZE M</Text>
          {badgeText && (
            <View style={styles.heroMiniBadge}>
              <Text style={styles.heroMiniBadgeText}>{badgeText}</Text>
            </View>
          )}
        </View>
      );
    case 'lamp':
      return (
        <View style={[styles.heroBox, { backgroundColor: '#1E1B4B' }]}>
          <View style={styles.lampHeroBeam} />
          <Text style={styles.heroBigEmoji}>💡</Text>
          <Text style={styles.heroGraphicTitle}>RECHARGEABLE STUDY LAMP</Text>
          <Text style={styles.heroGraphicSub}>
            TOUCH DIMMABLE · 3 COLOR TEMPERATURES
          </Text>
          {badgeText && (
            <View style={styles.heroMiniBadge}>
              <Text style={styles.heroMiniBadgeText}>{badgeText}</Text>
            </View>
          )}
        </View>
      );
    case 'dsa':
      return (
        <View style={[styles.heroBox, { backgroundColor: '#064E3B' }]}>
          <Text style={styles.codeBracketHero}>{'<Algorithms 4th Edition />'}</Text>
          <Text style={styles.heroGraphicTitle}>DATA STRUCTURES IN JAVA</Text>
          <Text style={styles.heroGraphicSub}>ROBERT SEDGEWICK · CS201 CORE</Text>
          {badgeText && (
            <View style={styles.heroMiniBadge}>
              <Text style={styles.heroMiniBadgeText}>{badgeText}</Text>
            </View>
          )}
        </View>
      );
    case 'drafting':
      return (
        <View style={[styles.heroBox, { backgroundColor: '#374151' }]}>
          <Text style={styles.heroBigEmoji}>📐</Text>
          <Text style={styles.heroGraphicTitle}>A2 DRAFTING BOARD & T-SQUARE</Text>
          <Text style={styles.heroGraphicSub}>
            ENGINEERING GRAPHICS ESSENTIAL
          </Text>
          {badgeText && (
            <View style={styles.heroMiniBadge}>
              <Text style={styles.heroMiniBadgeText}>{badgeText}</Text>
            </View>
          )}
        </View>
      );
    case 'hoodie':
      return (
        <View style={[styles.heroBox, { backgroundColor: '#1E3A8A' }]}>
          <Text style={styles.heroBigEmoji}>🧥</Text>
          <Text style={styles.heroGraphicTitle}>CAMPUS VARSITY HOODIE</Text>
          <Text style={styles.heroGraphicSub}>NAVY BLUE FLEECE · SIZE L</Text>
          {badgeText && (
            <View style={styles.heroMiniBadge}>
              <Text style={styles.heroMiniBadgeText}>{badgeText}</Text>
            </View>
          )}
        </View>
      );
    case 'headphones':
      return (
        <View style={[styles.heroBox, { backgroundColor: '#0F172A' }]}>
          <Text style={styles.heroBigEmoji}>🎧</Text>
          <Text style={styles.heroGraphicTitle}>ANC STUDY HEADPHONES</Text>
          <Text style={styles.heroGraphicSub}>ACTIVE NOISE CANCELLATION · 30H</Text>
          {badgeText && (
            <View style={styles.heroMiniBadge}>
              <Text style={styles.heroMiniBadgeText}>{badgeText}</Text>
            </View>
          )}
        </View>
      );
    default:
      return (
        <View style={[styles.heroBox, { backgroundColor: Cyberwave.midnightInk }]}>
          <Text style={styles.heroBigEmoji}>📦</Text>
          <Text style={styles.heroGraphicTitle}>{title}</Text>
        </View>
      );
  }
}

// ----------------------------------------------------
// STYLES
// ----------------------------------------------------
const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: Cyberwave.cloudWhite, // #F8FAFC
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // Toast Notification
  toastContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 9999,
    backgroundColor: Cyberwave.midnightInk,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
  toastText: {
    color: Cyberwave.white,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },

  // HEADER
  headerContainer: {
    backgroundColor: Cyberwave.electricBlue, // #3B82F6
    paddingHorizontal: 18,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: Cyberwave.electricBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  headerGlowCircle: {
    position: 'absolute',
    top: -30,
    right: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  backButtonArrow: {
    color: Cyberwave.white,
    fontSize: 16,
    fontWeight: '700',
    marginRight: 4,
  },
  backButtonText: {
    color: Cyberwave.white,
    fontSize: 13,
    fontWeight: '600',
  },
  shareButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  shareFallbackText: {
    color: Cyberwave.white,
    fontSize: 16,
    fontWeight: '700',
  },

  // PRODUCT HERO VISUAL
  heroVisualWrapper: {
    height: 230,
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: Cyberwave.lightBorder,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  heroTypeBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    zIndex: 2,
  },
  typeBadgeSale: {
    backgroundColor: 'rgba(239, 246, 255, 0.96)',
  },
  typeBadgeBorrow: {
    backgroundColor: 'rgba(236, 254, 255, 0.96)',
  },
  typeBadgeLend: {
    backgroundColor: 'rgba(245, 243, 255, 0.96)',
  },
  heroTypeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  typeTextSale: {
    color: '#2563EB',
  },
  typeTextBorrow: {
    color: '#0891B2',
  },
  typeTextLend: {
    color: '#7C3AED',
  },

  // HERO GRAPHICS
  heroBox: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    position: 'relative',
  },
  bookHeroSpine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 14,
    backgroundColor: Cyberwave.electricBlue,
  },
  bookHeroContent: {
    alignItems: 'center',
    paddingLeft: 10,
  },
  bookHeroSub: {
    fontSize: 10,
    fontWeight: '700',
    color: Cyberwave.cyan,
    letterSpacing: 1.5,
  },
  bookHeroMain: {
    fontSize: 16,
    fontWeight: '800',
    color: Cyberwave.white,
    marginTop: 2,
  },
  bookHeroMathWord: {
    fontSize: 24,
    fontWeight: '900',
    color: Cyberwave.electricBlue,
    letterSpacing: 2,
  },
  bookHeroFormula: {
    fontSize: 11,
    fontStyle: 'italic',
    color: '#94A3B8',
    marginTop: 6,
  },
  calcScreenBox: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#38BDF8',
    alignItems: 'center',
    marginBottom: 10,
  },
  calcScreenTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Cyberwave.cyan,
  },
  calcScreenFormula: {
    fontSize: 9,
    color: '#F8FAFC',
    marginTop: 2,
    letterSpacing: 1,
  },
  calcKeypadGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  calcKey: {
    width: 16,
    height: 10,
    borderRadius: 2,
    backgroundColor: '#64748B',
  },
  lampHeroBeam: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(253, 224, 71, 0.12)',
  },
  heroBigEmoji: {
    fontSize: 44,
    marginBottom: 6,
  },
  heroGraphicTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Cyberwave.white,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  heroGraphicSub: {
    fontSize: 10,
    fontWeight: '600',
    color: Cyberwave.cyan,
    marginTop: 4,
    letterSpacing: 1,
    textAlign: 'center',
  },
  codeBracketHero: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6EE7B7',
    marginBottom: 4,
  },
  heroMiniBadge: {
    marginTop: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  heroMiniBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Cyberwave.cyan,
  },

  // CARD CONTAINERS
  cardContainer: {
    backgroundColor: Cyberwave.white,
    borderRadius: 18,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: Cyberwave.lightBorder,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  categoryPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Cyberwave.electricBlue,
  },
  conditionPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  conditionPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: Cyberwave.mutedSlate,
  },
  postedTimeText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94A3B8',
    marginLeft: 'auto',
  },
  itemTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Cyberwave.midnightInk,
    letterSpacing: -0.3,
    lineHeight: 26,
    marginBottom: 10,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
  },
  priceText: {
    fontSize: 26,
    fontWeight: '900',
    color: Cyberwave.electricBlue,
  },
  priceFreeText: {
    color: '#16A34A', // Vibrant green
  },
  originalPriceWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  originalPriceText: {
    fontSize: 13,
    fontWeight: '500',
    color: Cyberwave.mutedSlate,
    textDecorationLine: 'line-through',
  },
  savingsPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  savingsPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
  },
  cardDivider: {
    height: 1,
    backgroundColor: Cyberwave.lightBorder,
    marginVertical: 14,
  },
  sectionBlock: {
    marginBottom: 8,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: Cyberwave.mutedSlate,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '500',
    color: Cyberwave.midnightInk,
  },
  availabilityNoteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 10,
    marginTop: 8,
    borderWidth: 0.5,
    borderColor: Cyberwave.lightBorder,
  },
  availabilityNoteIcon: {
    fontSize: 13,
  },
  availabilityNoteText: {
    fontSize: 12,
    fontWeight: '600',
    color: Cyberwave.mutedSlate,
  },

  // SELLER CARD
  sellerCardPressable: {
    paddingVertical: 14,
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  sellerAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Cyberwave.electricBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sellerAvatarInitials: {
    color: Cyberwave.white,
    fontSize: 15,
    fontWeight: '700',
  },
  sellerInfoCol: {
    flex: 1,
  },
  sellerNameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sellerName: {
    fontSize: 15,
    fontWeight: '700',
    color: Cyberwave.midnightInk,
  },
  verifiedBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#15803D',
  },
  sellerDepartment: {
    fontSize: 12,
    fontWeight: '500',
    color: Cyberwave.mutedSlate,
    marginTop: 2,
  },
  sellerChevron: {
    fontSize: 22,
    color: Cyberwave.mutedSlate,
    marginLeft: 6,
  },

  // CAMPUS MEETUP
  meetupHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  meetupLocationIcon: {
    fontSize: 24,
  },
  meetupLocationTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Cyberwave.midnightInk,
    marginTop: 1,
  },
  meetupNoteBox: {
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: Cyberwave.lightBorder,
  },
  meetupNoteText: {
    fontSize: 12,
    lineHeight: 18,
    color: Cyberwave.mutedSlate,
    fontWeight: '500',
  },

  // BOTTOM ACTION BUTTONS
  bottomActionsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Cyberwave.white,
    borderTopWidth: 1,
    borderTopColor: Cyberwave.lightBorder,
    paddingHorizontal: 16,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  primaryActionButton: {
    flex: 1,
    backgroundColor: Cyberwave.electricBlue,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Cyberwave.electricBlue,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  cyanActionButton: {
    backgroundColor: '#0891B2',
  },
  primaryActionText: {
    color: Cyberwave.white,
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryActionButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Cyberwave.lightBorder,
  },
  secondaryActionText: {
    color: Cyberwave.midnightInk,
    fontSize: 14,
    fontWeight: '700',
  },

  // NOT FOUND FALLBACK
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  notFoundEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Cyberwave.midnightInk,
    marginBottom: 6,
  },
  notFoundText: {
    fontSize: 13,
    color: Cyberwave.mutedSlate,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  notFoundButton: {
    backgroundColor: Cyberwave.electricBlue,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  notFoundButtonText: {
    color: Cyberwave.white,
    fontSize: 13,
    fontWeight: '700',
  },

  // MODALS
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  sellerPreviewCard: {
    backgroundColor: Cyberwave.white,
    borderRadius: 20,
    padding: 22,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  sellerModalAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Cyberwave.electricBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  sellerModalAvatarText: {
    color: Cyberwave.white,
    fontSize: 20,
    fontWeight: '800',
  },
  sellerModalName: {
    fontSize: 17,
    fontWeight: '800',
    color: Cyberwave.midnightInk,
  },
  sellerModalDept: {
    fontSize: 12,
    fontWeight: '500',
    color: Cyberwave.mutedSlate,
    marginTop: 2,
    marginBottom: 16,
    textAlign: 'center',
  },
  sellerStatsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Cyberwave.lightBorder,
  },
  sellerStatItem: {
    alignItems: 'center',
  },
  sellerStatNumber: {
    fontSize: 13,
    fontWeight: '800',
    color: Cyberwave.midnightInk,
  },
  sellerStatLabel: {
    fontSize: 10,
    color: Cyberwave.mutedSlate,
    marginTop: 1,
  },
  sellerStatDivider: {
    width: 1,
    backgroundColor: Cyberwave.lightBorder,
  },
  closeModalButton: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Cyberwave.lightBorder,
  },
  closeModalButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: Cyberwave.midnightInk,
  },

  // MAKE OFFER SHEET
  offerModalSheet: {
    backgroundColor: Cyberwave.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 12,
  },
  offerModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Cyberwave.midnightInk,
  },
  offerModalSubtitle: {
    fontSize: 13,
    color: Cyberwave.mutedSlate,
    marginTop: 4,
    marginBottom: 16,
  },
  offerPillOptionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  suggestedOfferPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Cyberwave.lightBorder,
  },
  suggestedOfferPillActive: {
    backgroundColor: '#EFF6FF',
    borderColor: Cyberwave.electricBlue,
  },
  suggestedOfferText: {
    fontSize: 14,
    fontWeight: '700',
    color: Cyberwave.midnightInk,
  },
  suggestedOfferTextActive: {
    color: Cyberwave.electricBlue,
  },
  modalActionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelOfferButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Cyberwave.lightBorder,
  },
  cancelOfferButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: Cyberwave.mutedSlate,
  },
  submitOfferButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Cyberwave.electricBlue,
    alignItems: 'center',
  },
  submitOfferButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: Cyberwave.white,
  },

  // HEADER OFFERS BUTTON
  headerActionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerOffersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  headerOffersButtonEmoji: {
    fontSize: 13,
  },
  headerOffersButtonText: {
    color: Cyberwave.white,
    fontSize: 12,
    fontWeight: '700',
  },
  headerOffersBadge: {
    backgroundColor: Cyberwave.amberAccent,
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginLeft: 2,
  },
  headerOffersBadgeText: {
    color: '#0F172A',
    fontSize: 10,
    fontWeight: '800',
  },

  // SELLER HEADER ROW
  sellerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sellerViewProfileHint: {
    color: Cyberwave.electricBlue,
    fontSize: 12,
    fontWeight: '700',
  },

  // FORM INPUTS
  offerFieldGroup: {
    marginBottom: 12,
  },
  offerFieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Cyberwave.midnightInk,
    marginBottom: 6,
  },
  offerAmountInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Cyberwave.lightBorder,
    paddingHorizontal: 12,
  },
  offerRupeePrefix: {
    fontSize: 16,
    fontWeight: '700',
    color: Cyberwave.midnightInk,
    marginRight: 6,
  },
  offerAmountInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 15,
    fontWeight: '700',
    color: Cyberwave.midnightInk,
  },
  offerNoteInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Cyberwave.lightBorder,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: Cyberwave.midnightInk,
    minHeight: 52,
    textAlignVertical: 'top',
  },
  offerErrorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
  },

  // SUCCESS STATE
  offerSuccessContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  offerSuccessIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  offerSuccessCheckEmoji: {
    fontSize: 26,
    color: '#16A34A',
    fontWeight: '800',
  },
  offerSuccessTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Cyberwave.midnightInk,
    marginBottom: 4,
  },
  offerSuccessSubtitle: {
    fontSize: 13,
    color: Cyberwave.mutedSlate,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  offerSuccessDetailCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Cyberwave.lightBorder,
    marginBottom: 20,
  },
  offerSuccessItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Cyberwave.midnightInk,
    marginBottom: 4,
  },
  offerSuccessMeta: {
    fontSize: 12,
    color: Cyberwave.mutedSlate,
    marginBottom: 4,
  },
  offerSuccessStatusText: {
    color: '#D97706',
    fontWeight: '700',
  },
  offerSuccessMsg: {
    fontSize: 12,
    fontStyle: 'italic',
    color: Cyberwave.mutedSlate,
    marginTop: 4,
  },
  viewOffersActionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: Cyberwave.electricBlue,
    alignItems: 'center',
  },
  viewOffersActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: Cyberwave.electricBlue,
  },
  doneOfferButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Cyberwave.electricBlue,
    alignItems: 'center',
  },
  doneOfferButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: Cyberwave.white,
  },

  // SENT OFFERS MODAL SHEET
  sentOffersModalSheet: {
    backgroundColor: Cyberwave.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 12,
  },
  sentOffersHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  closeRoundButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeRoundButtonText: {
    fontSize: 14,
    color: Cyberwave.mutedSlate,
    fontWeight: '700',
  },
  sentOffersScrollView: {
    maxHeight: 380,
  },
  sentOfferItemCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Cyberwave.lightBorder,
    marginBottom: 10,
  },
  sentOfferTopLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sentOfferItemTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: Cyberwave.midnightInk,
    marginRight: 8,
  },
  sentOfferStatusBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  sentOfferStatusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
  },
  sentOfferMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  sentOfferAmountText: {
    fontSize: 14,
    fontWeight: '800',
    color: Cyberwave.electricBlue,
  },
  sentOfferSellerText: {
    fontSize: 12,
    color: Cyberwave.mutedSlate,
  },
  sentOfferTimeText: {
    fontSize: 11,
    color: Cyberwave.mutedSlate,
    marginLeft: 'auto',
  },
  sentOfferNoteText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: Cyberwave.midnightInk,
    marginTop: 6,
    backgroundColor: Cyberwave.white,
    padding: 6,
    borderRadius: 8,
  },
  sentOffersEmptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  sentOffersEmptyEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  sentOffersEmptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Cyberwave.midnightInk,
    marginBottom: 4,
  },
  sentOffersEmptySub: {
    fontSize: 12,
    color: Cyberwave.mutedSlate,
    textAlign: 'center',
    paddingHorizontal: 20,
  },

  // HELPERS
  pressedOpacity: {
    opacity: 0.75,
  },
  pressedCardOpacity: {
    opacity: 0.94,
    transform: [{ scale: 0.99 }],
  },
});
