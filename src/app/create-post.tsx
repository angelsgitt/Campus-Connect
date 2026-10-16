import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  KeyboardAvoidingView,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SymbolView } from 'expo-symbols';

import {
  Cyberwave,
  MarketplaceCategory,
  MarketplaceItem,
  SAMPLE_MARKETPLACE_ITEMS,
  OpportunityItem,
  SAMPLE_OPPORTUNITIES,
  CommunityRequestItem,
  SAMPLE_COMMUNITY_REQUESTS,
  ResourceItem,
  ResourceType as GlobalResourceType,
  SAMPLE_RESOURCES,
} from '@/constants/cyberwave';
import { CyberwaveBottomNav } from '@/components/cyberwave-bottom-nav';

// ----------------------------------------------------
// POST TYPE DEFINITIONS & CONFIG
// ----------------------------------------------------
export type PostType = 'sell' | 'lend' | 'request' | 'resource' | 'opportunity';

interface PostTypeOption {
  id: PostType;
  title: string;
  badge: string;
  description: string;
  accentColor: string;
  iconName: {
    ios: string;
    android: string;
    web: string;
  };
  symbolFallback: string;
}

const POST_TYPES: PostTypeOption[] = [
  {
    id: 'sell',
    title: 'Sell',
    badge: 'Marketplace',
    description: 'Sell books, electronics & gear to students',
    accentColor: Cyberwave.electricBlue,
    iconName: {
      ios: 'tag.fill',
      android: 'sell',
      web: 'sell',
    },
    symbolFallback: '🏷️',
  },
  {
    id: 'lend',
    title: 'Lend',
    badge: 'Peer Share',
    description: 'Lend items to batchmates for free',
    accentColor: '#0891B2', // Deep cyan
    iconName: {
      ios: 'arrow.triangle.2.circlepath',
      android: 'swap_horiz',
      web: 'swap_horiz',
    },
    symbolFallback: '🔄',
  },
  {
    id: 'request',
    title: 'Request',
    badge: 'Wanted',
    description: 'Ask campus for items or equipment you need',
    accentColor: '#7C3AED', // Deep violet
    iconName: {
      ios: 'hand.raised.fill',
      android: 'live_help',
      web: 'live_help',
    },
    symbolFallback: '🙋',
  },
  {
    id: 'resource',
    title: 'Share Resource',
    badge: 'Academic',
    description: 'Share notes, lecture slides & past papers',
    accentColor: '#D97706', // Amber gold
    iconName: {
      ios: 'book.fill',
      android: 'menu_book',
      web: 'menu_book',
    },
    symbolFallback: '📚',
  },
  {
    id: 'opportunity',
    title: 'Opportunity',
    badge: 'Events',
    description: 'Share hackathons, club drives & projects',
    accentColor: '#16A34A', // Vibrant green
    iconName: {
      ios: 'sparkles',
      android: 'campaign',
      web: 'campaign',
    },
    symbolFallback: '✨',
  },
];

// Reusable selectable chips configuration
const MARKETPLACE_CATEGORIES: Exclude<MarketplaceCategory, 'All'>[] = [
  'Books',
  'Electronics',
  'Clothing',
  'Study Essentials',
  'Other',
];

const CONDITION_OPTIONS = ['New', 'Like New', 'Good', 'Fair'] as const;
type ConditionType = (typeof CONDITION_OPTIONS)[number];

const RESOURCE_TYPES = ['Notes', 'PDF', 'Link', 'Other'] as const;
type ResourceType = (typeof RESOURCE_TYPES)[number];

const OPPORTUNITY_TYPES = [
  'Hackathon',
  'Event',
  'Club Activity',
  'Team Formation',
  'Other',
] as const;
type OpportunityType = (typeof OPPORTUNITY_TYPES)[number];

// ----------------------------------------------------
// LOCAL MOCK STATE STORAGE (SESSION ONLY)
// ----------------------------------------------------
export interface CreatedPostRecord {
  id: string;
  type: PostType;
  title: string;
  timestamp: string;
  summary: string;
}

export const LOCAL_SESSION_POSTS: CreatedPostRecord[] = [
  {
    id: 'user-post-1',
    type: 'sell',
    title: 'Operating System Concepts (10th Edition)',
    timestamp: 'Yesterday',
    summary: '₹350 · Books · Central Library Foyer',
  },
  {
    id: 'user-res-1',
    type: 'resource',
    title: 'Operating Systems Scheduling & Memory Cheatsheet',
    timestamp: '3 days ago',
    summary: 'Study Guide · Computer Science',
  },
];

// ----------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------
export default function CreatePostScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { type: initialTypeParam } = useLocalSearchParams<{ type?: string }>();

  // Active post type selection (default: 'sell' or preselected from route params)
  const initialPostType: PostType =
    initialTypeParam &&
    ['sell', 'lend', 'request', 'resource', 'opportunity'].includes(initialTypeParam)
      ? (initialTypeParam as PostType)
      : 'sell';
  const [selectedType, setSelectedType] = useState<PostType>(initialPostType);

  // Shared / Dynamic Form Fields State
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState<ConditionType>('Like New');
  const [category, setCategory] = useState<Exclude<MarketplaceCategory, 'All'>>('Books');
  const [description, setDescription] = useState('');
  const [meetupLocation, setMeetupLocation] = useState('');
  const [lendingDuration, setLendingDuration] = useState('');
  const [needDate, setNeedDate] = useState('');
  const [requestBudget, setRequestBudget] = useState('');
  const [resourceType, setResourceType] = useState<ResourceType>('Notes');
  const [subjectCourse, setSubjectCourse] = useState('');
  const [resourceUrl, setResourceUrl] = useState('');
  const [opportunityType, setOpportunityType] = useState<OpportunityType>('Hackathon');
  const [eventDate, setEventDate] = useState('');
  const [registrationUrl, setRegistrationUrl] = useState('');

  // Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Success Feedback Modal
  const [publishedPost, setPublishedPost] = useState<CreatedPostRecord | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // In-app Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
      router.push('/');
    }
  };

  const clearFieldError = (fieldName: string) => {
    if (errors[fieldName]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
    }
  };

  const handleTypeChange = (newType: PostType) => {
    setSelectedType(newType);
    setErrors({});
  };

  // Form Validation & Submission
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title =
        selectedType === 'request'
          ? 'Please specify what you need.'
          : selectedType === 'resource'
          ? 'Please enter a resource title.'
          : selectedType === 'opportunity'
          ? 'Please enter an opportunity title.'
          : 'Item title is required.';
    }

    if (!description.trim()) {
      newErrors.description = 'Please provide a brief description.';
    }

    if (selectedType === 'sell') {
      if (!price.trim()) {
        newErrors.price = 'Please enter a price in ₹.';
      } else if (isNaN(Number(price.replace(/[^\d.]/g, '')))) {
        newErrors.price = 'Enter a valid numeric price.';
      }
      if (!meetupLocation.trim()) {
        newErrors.meetupLocation = 'Please specify a campus meetup spot.';
      }
    } else if (selectedType === 'lend') {
      if (!lendingDuration.trim()) {
        newErrors.lendingDuration = 'Please state how long this item is lendable.';
      }
      if (!meetupLocation.trim()) {
        newErrors.meetupLocation = 'Please specify a campus meetup spot.';
      }
    } else if (selectedType === 'request') {
      if (!needDate.trim()) {
        newErrors.needDate = 'Please specify when you need this item.';
      }
    } else if (selectedType === 'resource') {
      if (!subjectCourse.trim()) {
        newErrors.subjectCourse = 'Please enter the subject or course code.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePublish = () => {
    if (!validateForm()) {
      showToast('Please fix the highlighted fields to publish.');
      return;
    }

    const newId = `session-post-${Date.now()}`;
    const formattedPrice =
      selectedType === 'sell'
        ? `₹${price.replace(/[^\d]/g, '') || price}`
        : 'Free';

    // If Sell or Lend, also inject into runtime marketplace items so users can immediately view it!
    if (selectedType === 'sell' || selectedType === 'lend') {
      const marketplaceRecord: MarketplaceItem = {
        id: newId,
        title: title.trim(),
        category,
        listingType: selectedType === 'sell' ? 'For sale' : 'Lend',
        price: formattedPrice,
        condition,
        sellerName: 'Alex (You)',
        sellerInitials: 'AY',
        sellerDepartment: 'Campus Connect · Current Session',
        postedTime: 'Just now',
        description: description.trim(),
        location: meetupLocation.trim(),
        badgeText: selectedType === 'sell' ? 'Student Listing' : 'Lendable',
        visualType:
          category === 'Books'
            ? 'book'
            : category === 'Electronics'
            ? 'calculator'
            : category === 'Clothing'
            ? 'hoodie'
            : 'lamp',
      };
      SAMPLE_MARKETPLACE_ITEMS.unshift(marketplaceRecord);
    }

    if (selectedType === 'opportunity') {
      const oppRecord: OpportunityItem = {
        id: newId,
        title: title.trim(),
        type: opportunityType,
        description: description.trim(),
        dateOrDeadline: eventDate.trim() || undefined,
        registrationUrl: registrationUrl.trim() || undefined,
        organizerName: 'Alex (You)',
        organizerInitials: 'AY',
        badgeText: `${opportunityType} · Campus`,
        location: 'Campus Opportunity',
      };
      SAMPLE_OPPORTUNITIES.unshift(oppRecord);
    }

    if (selectedType === 'request') {
      const formattedBudget = requestBudget.trim()
        ? `₹${requestBudget.replace(/[^\d]/g, '') || requestBudget.trim()}`
        : 'Free Borrow';

      const requestPostRecord: MarketplaceItem = {
        id: newId,
        title: title.trim(),
        category,
        listingType: 'Borrow',
        price: formattedBudget,
        sellerName: 'Alex (You)',
        sellerInitials: 'AY',
        sellerDepartment: 'Campus Connect · Current Session',
        postedTime: 'Just now',
        description: description.trim(),
        location: 'Campus Meetup / Academic Block',
        badgeText: `Needed: ${needDate.trim()}`,
        visualType:
          category === 'Books'
            ? 'book'
            : category === 'Electronics'
            ? 'calculator'
            : category === 'Clothing'
            ? 'hoodie'
            : 'lamp',
      };
      SAMPLE_MARKETPLACE_ITEMS.unshift(requestPostRecord);

      const requestRecord: CommunityRequestItem = {
        id: newId,
        title: title.trim(),
        category,
        whenNeeded: needDate.trim(),
        budget: formattedBudget,
        description: description.trim(),
        requesterName: 'Alex (You)',
        requesterInitials: 'AY',
        requesterDept: 'Campus Connect · Current Session',
        postedTime: 'Just now',
        linkedPostId: newId,
      };
      SAMPLE_COMMUNITY_REQUESTS.unshift(requestRecord);
    }

    if (selectedType === 'resource') {
      const mappedType: GlobalResourceType =
        resourceType === 'Notes'
          ? 'Notes'
          : resourceType === 'Link'
          ? 'Link'
          : resourceType === 'PDF'
          ? 'Notes'
          : 'Study Guide';

      const resourceRecord: ResourceItem = {
        id: newId,
        title: title.trim(),
        subject: subjectCourse.trim() || 'General Academics',
        type: mappedType,
        contributorName: 'Alex (You)',
        contributorInitials: 'AY',
        contributorDept: 'Campus Connect · Current Session',
        uploadTime: 'Just now',
        description: description.trim(),
        formatOrLinkText: resourceUrl.trim()
          ? (resourceUrl.trim().startsWith('http') ? 'Shared Web Link' : 'Shared Link')
          : `${resourceType} · Student Document`,
        resourceUrl: resourceUrl.trim() || undefined,
        isDemoOnly: !resourceUrl.trim(),
        fileSize: resourceUrl.trim() ? undefined : 'Shared File',
        filePages: resourceUrl.trim() ? undefined : 'Current Session',
        semester: 'Current Session',
        tags: [subjectCourse.trim(), resourceType].filter(Boolean),
      };
      SAMPLE_RESOURCES.unshift(resourceRecord);
    }

    const record: CreatedPostRecord = {
      id: newId,
      type: selectedType,
      title: title.trim(),
      timestamp: 'Just now',
      summary:
        selectedType === 'sell'
          ? `${formattedPrice} · ${category} · ${meetupLocation}`
          : selectedType === 'lend'
          ? `Lendable (${lendingDuration}) · ${meetupLocation}`
          : selectedType === 'request'
          ? `Needed: ${needDate} · ${category}`
          : selectedType === 'resource'
          ? `${resourceType} · ${subjectCourse}`
          : `${opportunityType} · Campus Opportunity`,
    };

    LOCAL_SESSION_POSTS.unshift(record);
    setPublishedPost(record);
    setShowSuccessModal(true);
  };

  const resetForm = () => {
    setTitle('');
    setPrice('');
    setDescription('');
    setMeetupLocation('');
    setLendingDuration('');
    setNeedDate('');
    setRequestBudget('');
    setSubjectCourse('');
    setResourceUrl('');
    setEventDate('');
    setRegistrationUrl('');
    setErrors({});
    setShowSuccessModal(false);
    setPublishedPost(null);
  };

  const activePostTypeConfig =
    POST_TYPES.find((pt) => pt.id === selectedType) ?? POST_TYPES[0];

  const bottomBarHeight = 64 + Math.max(insets.bottom, 12);
  const scrollPaddingBottom = bottomBarHeight + 36;

  return (
    <View style={styles.screenContainer}>
      <StatusBar style="light" />

      {/* In-app Toast Banner */}
      {toastMessage && (
        <View style={[styles.toastContainer, { top: Math.max(insets.top, 16) + 8 }]}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* HEADER SECTION (ELECTRIC BLUE WITH BACK BUTTON & TITLE) */}
      <View
        style={[
          styles.headerContainer,
          { paddingTop: Math.max(insets.top, 20) + 8 },
        ]}>
        {/* Subtle Cyberwave background glow circles */}
        <View style={styles.headerGlowCircleOne} />
        <View style={styles.headerGlowCircleTwo} />

        <View style={styles.headerTopBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            onPress={handleBack}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressedOpacity,
            ]}>
            <Text style={styles.backButtonArrow}>←</Text>
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Create a Post</Text>
            <Text style={styles.headerSubtitle}>
              Share with your campus community
            </Text>
          </View>

          <View style={styles.draftBadge}>
            <Text style={styles.draftBadgeText}>Draft</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: scrollPaddingBottom },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {/* STEP 1: SELECT POST TYPE */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>1. Select Post Type</Text>
            <View
              style={[
                styles.typePillBadge,
                { backgroundColor: `${activePostTypeConfig.accentColor}18` },
              ]}>
              <Text
                style={[
                  styles.typePillBadgeText,
                  { color: activePostTypeConfig.accentColor },
                ]}>
                {activePostTypeConfig.title}
              </Text>
            </View>
          </View>

          {/* Horizontal Scrollable Post-Type Cards */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.postTypesScrollContent}
            style={styles.postTypesScrollView}>
            {POST_TYPES.map((typeOption) => {
              const isSelected = selectedType === typeOption.id;
              return (
                <Pressable
                  key={typeOption.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Select post type ${typeOption.title}`}
                  onPress={() => handleTypeChange(typeOption.id)}
                  style={({ pressed }) => [
                    styles.typeCard,
                    isSelected && [
                      styles.typeCardSelected,
                      { borderColor: typeOption.accentColor },
                    ],
                    pressed && styles.pressedCardOpacity,
                  ]}>
                  {/* Top row with icon & selection indicator */}
                  <View style={styles.typeCardTopRow}>
                    <View
                      style={[
                        styles.typeCardIconCircle,
                        {
                          backgroundColor: isSelected
                            ? `${typeOption.accentColor}20`
                            : '#F1F5F9',
                        },
                      ]}>
                      <SymbolView
                        name={typeOption.iconName as any}
                        size={18}
                        tintColor={
                          isSelected
                            ? typeOption.accentColor
                            : Cyberwave.mutedSlate
                        }
                        fallback={
                          <Text style={{ fontSize: 16 }}>
                            {typeOption.symbolFallback}
                          </Text>
                        }
                      />
                    </View>

                    {isSelected ? (
                      <View
                        style={[
                          styles.typeSelectedCheckmark,
                          { backgroundColor: typeOption.accentColor },
                        ]}>
                        <Text style={styles.typeSelectedCheckmarkText}>✓</Text>
                      </View>
                    ) : (
                      <View style={styles.typeUnselectedDot} />
                    )}
                  </View>

                  <Text
                    style={[
                      styles.typeCardTitle,
                      isSelected && { color: typeOption.accentColor },
                    ]}>
                    {typeOption.title}
                  </Text>
                  <Text style={styles.typeCardBadge}>
                    {typeOption.badge}
                  </Text>
                  <Text
                    style={styles.typeCardDescription}
                    numberOfLines={2}>
                    {typeOption.description}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* STEP 2: DYNAMIC FORM CARD */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>
              2. {activePostTypeConfig.title} Details
            </Text>
            <Text style={styles.requiredNotice}>* Required fields</Text>
          </View>

          <View style={styles.formCard}>
            {/* ---------------- TYPE: SELL ---------------- */}
            {selectedType === 'sell' && (
              <>
                {/* Item Title */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>
                    Item Title <Text style={styles.requiredAsterisk}>*</Text>
                  </Text>
                  <TextInput
                    style={[styles.textInput, errors.title && styles.inputError]}
                    placeholder="e.g. Higher Engineering Mathematics 8th Ed"
                    placeholderTextColor="#94A3B8"
                    value={title}
                    onChangeText={(val) => {
                      setTitle(val);
                      clearFieldError('title');
                    }}
                  />
                  {errors.title && (
                    <Text style={styles.errorText}>⚠ {errors.title}</Text>
                  )}
                </View>

                {/* Price */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>
                    Price (₹) <Text style={styles.requiredAsterisk}>*</Text>
                  </Text>
                  <View style={styles.priceInputWrapper}>
                    <View style={styles.currencyPrefixBox}>
                      <Text style={styles.currencyPrefixText}>₹</Text>
                    </View>
                    <TextInput
                      style={[
                        styles.textInputWithPrefix,
                        errors.price && styles.inputError,
                      ]}
                      placeholder="e.g. 250"
                      placeholderTextColor="#94A3B8"
                      value={price}
                      keyboardType="numeric"
                      onChangeText={(val) => {
                        setPrice(val);
                        clearFieldError('price');
                      }}
                    />
                  </View>
                  {errors.price && (
                    <Text style={styles.errorText}>⚠ {errors.price}</Text>
                  )}
                </View>

                {/* Condition Chips */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>
                    Condition <Text style={styles.requiredAsterisk}>*</Text>
                  </Text>
                  <View style={styles.chipsRow}>
                    {CONDITION_OPTIONS.map((cond) => {
                      const isActive = condition === cond;
                      return (
                        <Pressable
                          key={cond}
                          onPress={() => setCondition(cond)}
                          style={[
                            styles.chipButton,
                            isActive && styles.chipButtonActive,
                          ]}>
                          <Text
                            style={[
                              styles.chipText,
                              isActive && styles.chipTextActive,
                            ]}>
                            {cond}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* Category Chips */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>
                    Category <Text style={styles.requiredAsterisk}>*</Text>
                  </Text>
                  <View style={styles.chipsRow}>
                    {MARKETPLACE_CATEGORIES.map((cat) => {
                      const isActive = category === cat;
                      return (
                        <Pressable
                          key={cat}
                          onPress={() => setCategory(cat)}
                          style={[
                            styles.chipButton,
                            isActive && styles.chipButtonActive,
                          ]}>
                          <Text
                            style={[
                              styles.chipText,
                              isActive && styles.chipTextActive,
                            ]}>
                            {cat}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* Meetup Location */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>
                    Meetup Location <Text style={styles.requiredAsterisk}>*</Text>
                  </Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      errors.meetupLocation && styles.inputError,
                    ]}
                    placeholder="e.g. Central Library foyer / North Hostel"
                    placeholderTextColor="#94A3B8"
                    value={meetupLocation}
                    onChangeText={(val) => {
                      setMeetupLocation(val);
                      clearFieldError('meetupLocation');
                    }}
                  />
                  {errors.meetupLocation && (
                    <Text style={styles.errorText}>
                      ⚠ {errors.meetupLocation}
                    </Text>
                  )}
                </View>

                {/* Description */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>
                    Description <Text style={styles.requiredAsterisk}>*</Text>
                  </Text>
                  <TextInput
                    style={[
                      styles.textAreaInput,
                      errors.description && styles.inputError,
                    ]}
                    placeholder="Describe item condition, edition, markings, or included accessories..."
                    placeholderTextColor="#94A3B8"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    value={description}
                    onChangeText={(val) => {
                      setDescription(val);
                      clearFieldError('description');
                    }}
                  />
                  {errors.description && (
                    <Text style={styles.errorText}>⚠ {errors.description}</Text>
                  )}
                </View>

                {/* Optional Image Upload Placeholder */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Photos (Optional)</Text>
                  <View style={styles.imageUploadPlaceholderCard}>
                    <Text style={styles.imagePlaceholderIcon}>📷</Text>
                    <Text style={styles.imagePlaceholderTitle}>
                      Add Item Photos
                    </Text>
                    <Text style={styles.imagePlaceholderSubtitle}>
                      Photo upload placeholder (Native image picker is not installed)
                    </Text>
                  </View>
                </View>
              </>
            )}

            {/* ---------------- TYPE: LEND ---------------- */}
            {selectedType === 'lend' && (
              <>
                {/* Item Title */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>
                    Item Title <Text style={styles.requiredAsterisk}>*</Text>
                  </Text>
                  <TextInput
                    style={[styles.textInput, errors.title && styles.inputError]}
                    placeholder="e.g. White Lab Coat (Size M) or Lab Kit"
                    placeholderTextColor="#94A3B8"
                    value={title}
                    onChangeText={(val) => {
                      setTitle(val);
                      clearFieldError('title');
                    }}
                  />
                  {errors.title && (
                    <Text style={styles.errorText}>⚠ {errors.title}</Text>
                  )}
                </View>

                {/* Category Chips */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>
                    Category <Text style={styles.requiredAsterisk}>*</Text>
                  </Text>
                  <View style={styles.chipsRow}>
                    {MARKETPLACE_CATEGORIES.map((cat) => {
                      const isActive = category === cat;
                      return (
                        <Pressable
                          key={cat}
                          onPress={() => setCategory(cat)}
                          style={[
                            styles.chipButton,
                            isActive && styles.chipButtonActive,
                          ]}>
                          <Text
                            style={[
                              styles.chipText,
                              isActive && styles.chipTextActive,
                            ]}>
                            {cat}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* Condition Chips */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>
                    Condition <Text style={styles.requiredAsterisk}>*</Text>
                  </Text>
                  <View style={styles.chipsRow}>
                    {CONDITION_OPTIONS.map((cond) => {
                      const isActive = condition === cond;
                      return (
                        <Pressable
                          key={cond}
                          onPress={() => setCondition(cond)}
                          style={[
                            styles.chipButton,
                            isActive && styles.chipButtonActive,
                          ]}>
                          <Text
                            style={[
                              styles.chipText,
                              isActive && styles.chipTextActive,
                            ]}>
                            {cond}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* Available Until / Lending Duration */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>
                    Available Until / Lending Duration{' '}
                    <Text style={styles.requiredAsterisk}>*</Text>
                  </Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      errors.lendingDuration && styles.inputError,
                    ]}
                    placeholder="e.g. 2 weeks / Until end of semester / Exam week"
                    placeholderTextColor="#94A3B8"
                    value={lendingDuration}
                    onChangeText={(val) => {
                      setLendingDuration(val);
                      clearFieldError('lendingDuration');
                    }}
                  />
                  {errors.lendingDuration && (
                    <Text style={styles.errorText}>
                      ⚠ {errors.lendingDuration}
                    </Text>
                  )}
                </View>

                {/* Meetup Location */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>
                    Meetup Location <Text style={styles.requiredAsterisk}>*</Text>
                  </Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      errors.meetupLocation && styles.inputError,
                    ]}
                    placeholder="e.g. Chemistry Lab Block / Academic Canteen"
                    placeholderTextColor="#94A3B8"
                    value={meetupLocation}
                    onChangeText={(val) => {
                      setMeetupLocation(val);
                      clearFieldError('meetupLocation');
                    }}
                  />
                  {errors.meetupLocation && (
                    <Text style={styles.errorText}>
                      ⚠ {errors.meetupLocation}
                    </Text>
                  )}
                </View>

                {/* Description */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>
                    Description <Text style={styles.requiredAsterisk}>*</Text>
                  </Text>
                  <TextInput
                    style={[
                      styles.textAreaInput,
                      errors.description && styles.inputError,
                    ]}
                    placeholder="Explain borrowing terms, return expectations, or safety notes..."
                    placeholderTextColor="#94A3B8"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    value={description}
                    onChangeText={(val) => {
                      setDescription(val);
                      clearFieldError('description');
                    }}
                  />
                  {errors.description && (
                    <Text style={styles.errorText}>⚠ {errors.description}</Text>
                  )}
                </View>

                {/* Optional Image Upload Placeholder */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Photos (Optional)</Text>
                  <View style={styles.imageUploadPlaceholderCard}>
                    <Text style={styles.imagePlaceholderIcon}>📷</Text>
                    <Text style={styles.imagePlaceholderTitle}>
                      Add Item Photos
                    </Text>
                    <Text style={styles.imagePlaceholderSubtitle}>
                      Photo upload placeholder (Native image picker is not installed)
                    </Text>
                  </View>
                </View>
              </>
            )}

            {/* ---------------- TYPE: REQUEST ---------------- */}
            {selectedType === 'request' && (
              <>
                {/* What do you need? */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>
                    What do you need?{' '}
                    <Text style={styles.requiredAsterisk}>*</Text>
                  </Text>
                  <TextInput
                    style={[styles.textInput, errors.title && styles.inputError]}
                    placeholder="e.g. Scientific Calculator for Friday Exam / Drafting Board"
                    placeholderTextColor="#94A3B8"
                    value={title}
                    onChangeText={(val) => {
                      setTitle(val);
                      clearFieldError('title');
                    }}
                  />
                  {errors.title && (
                    <Text style={styles.errorText}>⚠ {errors.title}</Text>
                  )}
                </View>

                {/* Category Chips */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>
                    Category <Text style={styles.requiredAsterisk}>*</Text>
                  </Text>
                  <View style={styles.chipsRow}>
                    {MARKETPLACE_CATEGORIES.map((cat) => {
                      const isActive = category === cat;
                      return (
                        <Pressable
                          key={cat}
                          onPress={() => setCategory(cat)}
                          style={[
                            styles.chipButton,
                            isActive && styles.chipButtonActive,
                          ]}>
                          <Text
                            style={[
                              styles.chipText,
                              isActive && styles.chipTextActive,
                            ]}>
                            {cat}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* Optional Budget in ₹ */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Optional Budget (₹)</Text>
                  <View style={styles.priceInputWrapper}>
                    <View style={styles.currencyPrefixBox}>
                      <Text style={styles.currencyPrefixText}>₹</Text>
                    </View>
                    <TextInput
                      style={styles.textInputWithPrefix}
                      placeholder="e.g. Up to 150 or leave empty for free borrow"
                      placeholderTextColor="#94A3B8"
                      value={requestBudget}
                      keyboardType="numeric"
                      onChangeText={setRequestBudget}
                    />
                  </View>
                </View>

                {/* When do you need it? */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>
                    When do you need it?{' '}
                    <Text style={styles.requiredAsterisk}>*</Text>
                  </Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      errors.needDate && styles.inputError,
                    ]}
                    placeholder="e.g. Tomorrow by 9:00 AM / Before Tuesday lab"
                    placeholderTextColor="#94A3B8"
                    value={needDate}
                    onChangeText={(val) => {
                      setNeedDate(val);
                      clearFieldError('needDate');
                    }}
                  />
                  {errors.needDate && (
                    <Text style={styles.errorText}>⚠ {errors.needDate}</Text>
                  )}
                </View>

                {/* Description */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>
                    Description <Text style={styles.requiredAsterisk}>*</Text>
                  </Text>
                  <TextInput
                    style={[
                      styles.textAreaInput,
                      errors.description && styles.inputError,
                    ]}
                    placeholder="Explain why you need it, for which class/exam, and return promise..."
                    placeholderTextColor="#94A3B8"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    value={description}
                    onChangeText={(val) => {
                      setDescription(val);
                      clearFieldError('description');
                    }}
                  />
                  {errors.description && (
                    <Text style={styles.errorText}>⚠ {errors.description}</Text>
                  )}
                </View>
              </>
            )}

            {/* ---------------- TYPE: SHARE RESOURCE ---------------- */}
            {selectedType === 'resource' && (
              <>
                {/* Resource Title */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>
                    Resource Title <Text style={styles.requiredAsterisk}>*</Text>
                  </Text>
                  <TextInput
                    style={[styles.textInput, errors.title && styles.inputError]}
                    placeholder="e.g. DSA Midterm Solved Papers & Cheatsheet"
                    placeholderTextColor="#94A3B8"
                    value={title}
                    onChangeText={(val) => {
                      setTitle(val);
                      clearFieldError('title');
                    }}
                  />
                  {errors.title && (
                    <Text style={styles.errorText}>⚠ {errors.title}</Text>
                  )}
                </View>

                {/* Resource Type */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>
                    Resource Type <Text style={styles.requiredAsterisk}>*</Text>
                  </Text>
                  <View style={styles.chipsRow}>
                    {RESOURCE_TYPES.map((resType) => {
                      const isActive = resourceType === resType;
                      return (
                        <Pressable
                          key={resType}
                          onPress={() => setResourceType(resType)}
                          style={[
                            styles.chipButton,
                            isActive && styles.chipButtonActive,
                          ]}>
                          <Text
                            style={[
                              styles.chipText,
                              isActive && styles.chipTextActive,
                            ]}>
                            {resType}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* Subject / Course */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>
                    Subject / Course <Text style={styles.requiredAsterisk}>*</Text>
                  </Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      errors.subjectCourse && styles.inputError,
                    ]}
                    placeholder="e.g. CS201 Data Structures & Algorithms"
                    placeholderTextColor="#94A3B8"
                    value={subjectCourse}
                    onChangeText={(val) => {
                      setSubjectCourse(val);
                      clearFieldError('subjectCourse');
                    }}
                  />
                  {errors.subjectCourse && (
                    <Text style={styles.errorText}>
                      ⚠ {errors.subjectCourse}
                    </Text>
                  )}
                </View>

                {/* Resource URL (Optional) */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Resource Link (Optional)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="https://drive.google.com/... or GitHub link"
                    placeholderTextColor="#94A3B8"
                    autoCapitalize="none"
                    keyboardType="url"
                    value={resourceUrl}
                    onChangeText={setResourceUrl}
                  />
                </View>

                {/* Description */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>
                    Description <Text style={styles.requiredAsterisk}>*</Text>
                  </Text>
                  <TextInput
                    style={[
                      styles.textAreaInput,
                      errors.description && styles.inputError,
                    ]}
                    placeholder="Summarize what topics are covered, professor references, semester..."
                    placeholderTextColor="#94A3B8"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    value={description}
                    onChangeText={(val) => {
                      setDescription(val);
                      clearFieldError('description');
                    }}
                  />
                  {errors.description && (
                    <Text style={styles.errorText}>⚠ {errors.description}</Text>
                  )}
                </View>
              </>
            )}

            {/* ---------------- TYPE: OPPORTUNITY ---------------- */}
            {selectedType === 'opportunity' && (
              <>
                {/* Opportunity Title */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>
                    Opportunity Title <Text style={styles.requiredAsterisk}>*</Text>
                  </Text>
                  <TextInput
                    style={[styles.textInput, errors.title && styles.inputError]}
                    placeholder="e.g. Campus HackSprint 2026 / Robotics Club Drive"
                    placeholderTextColor="#94A3B8"
                    value={title}
                    onChangeText={(val) => {
                      setTitle(val);
                      clearFieldError('title');
                    }}
                  />
                  {errors.title && (
                    <Text style={styles.errorText}>⚠ {errors.title}</Text>
                  )}
                </View>

                {/* Opportunity Type */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>
                    Opportunity Type <Text style={styles.requiredAsterisk}>*</Text>
                  </Text>
                  <View style={styles.chipsRow}>
                    {OPPORTUNITY_TYPES.map((opType) => {
                      const isActive = opportunityType === opType;
                      return (
                        <Pressable
                          key={opType}
                          onPress={() => setOpportunityType(opType)}
                          style={[
                            styles.chipButton,
                            isActive && styles.chipButtonActive,
                          ]}>
                          <Text
                            style={[
                              styles.chipText,
                              isActive && styles.chipTextActive,
                            ]}>
                            {opType}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* Date or Deadline (Optional) */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Date or Deadline (Optional)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Registrations close March 30, 2026"
                    placeholderTextColor="#94A3B8"
                    value={eventDate}
                    onChangeText={setEventDate}
                  />
                </View>

                {/* Registration URL (Optional) */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Registration URL (Optional)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="https://hacksprint.campus.edu or Google Form"
                    placeholderTextColor="#94A3B8"
                    autoCapitalize="none"
                    keyboardType="url"
                    value={registrationUrl}
                    onChangeText={setRegistrationUrl}
                  />
                </View>

                {/* Description */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>
                    Description <Text style={styles.requiredAsterisk}>*</Text>
                  </Text>
                  <TextInput
                    style={[
                      styles.textAreaInput,
                      errors.description && styles.inputError,
                    ]}
                    placeholder="Outline eligibility, team size, prize pool, mentors, and how to apply..."
                    placeholderTextColor="#94A3B8"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    value={description}
                    onChangeText={(val) => {
                      setDescription(val);
                      clearFieldError('description');
                    }}
                  />
                  {errors.description && (
                    <Text style={styles.errorText}>⚠ {errors.description}</Text>
                  )}
                </View>
              </>
            )}

            {/* SUBMIT BUTTON */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Publish Post"
              onPress={handlePublish}
              style={({ pressed }) => [
                styles.publishButton,
                pressed && styles.pressedButtonOpacity,
              ]}>
              <Text style={styles.publishButtonText}>
                🚀 Publish {activePostTypeConfig.title}
              </Text>
            </Pressable>

            {/* Local-only friendly disclaimer */}
            <View style={styles.disclaimerContainer}>
              <Text style={styles.disclaimerText}>
                💡 Posts are saved in local session memory for this demo.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* SUCCESS CONFIRMATION MODAL */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.successIconCircle}>
              <Text style={styles.successEmoji}>🎉</Text>
            </View>

            <Text style={styles.modalTitle}>Post Published!</Text>
            <Text style={styles.modalSubtitle}>
              Your {publishedPost?.type} post is now active in this session.
            </Text>

            {publishedPost && (
              <View style={styles.publishedSummaryCard}>
                <View style={styles.publishedTitleRow}>
                  <Text style={styles.publishedTitle} numberOfLines={2}>
                    {publishedPost.title}
                  </Text>
                </View>
                <Text style={styles.publishedMeta}>
                  {publishedPost.summary}
                </Text>
              </View>
            )}

            <View style={styles.sessionNoticeBox}>
              <Text style={styles.sessionNoticeTitle}>Session State Note</Text>
              <Text style={styles.sessionNoticeBody}>
                This post is stored in local app state for testing. It is not
                permanently saved to a backend server.
              </Text>
            </View>

            <View style={styles.modalActionRow}>
              {(selectedType === 'sell' || selectedType === 'lend') && (
                <Pressable
                  onPress={() => {
                    setShowSuccessModal(false);
                    router.push('/marketplace' as any);
                  }}
                  style={styles.modalPrimaryBtn}>
                  <Text style={styles.modalPrimaryBtnText}>
                    View in Marketplace
                  </Text>
                </Pressable>
              )}

              {selectedType === 'opportunity' && (
                <Pressable
                  onPress={() => {
                    setShowSuccessModal(false);
                    router.push(`/opportunity/${publishedPost?.id}` as any);
                  }}
                  style={styles.modalPrimaryBtn}>
                  <Text style={styles.modalPrimaryBtnText}>
                    View Opportunity
                  </Text>
                </Pressable>
              )}

              {selectedType === 'resource' && (
                <Pressable
                  onPress={() => {
                    setShowSuccessModal(false);
                    router.push('/resources' as any);
                  }}
                  style={styles.modalPrimaryBtn}>
                  <Text style={styles.modalPrimaryBtnText}>
                    View in Resources
                  </Text>
                </Pressable>
              )}

              {selectedType !== 'sell' &&
                selectedType !== 'lend' &&
                selectedType !== 'opportunity' &&
                selectedType !== 'resource' && (
                  <Pressable
                    onPress={() => {
                      setShowSuccessModal(false);
                      router.push('/explore');
                    }}
                    style={styles.modalPrimaryBtn}>
                    <Text style={styles.modalPrimaryBtnText}>
                      Explore Posts
                    </Text>
                  </Pressable>
                )}

              <Pressable
                onPress={resetForm}
                style={styles.modalSecondaryBtn}>
                <Text style={styles.modalSecondaryBtnText}>
                  Create Another Post
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setShowSuccessModal(false);
                  router.push('/');
                }}
                style={styles.modalTextBtn}>
                <Text style={styles.modalTextBtnLabel}>Back to Home</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* BOTTOM NAVIGATION */}
      <CyberwaveBottomNav onToast={showToast} />
    </View>
  );
}

// ----------------------------------------------------
// STYLES (CYBERWAVE DESIGN SYSTEM)
// ----------------------------------------------------
const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: Cyberwave.cloudWhite, // #F8FAFC
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  // Toast
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

  // HEADER (ELECTRIC BLUE)
  headerContainer: {
    backgroundColor: Cyberwave.electricBlue, // #3B82F6
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: Cyberwave.electricBlue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  headerGlowCircleOne: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(34, 211, 238, 0.18)', // Cyan glow
    top: -80,
    right: -40,
  },
  headerGlowCircleTwo: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(167, 139, 250, 0.15)', // Violet glow
    bottom: -60,
    left: -30,
  },
  headerTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
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
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  headerTitle: {
    color: Cyberwave.white,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 12,
    marginTop: 2,
  },
  draftBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  draftBadgeText: {
    color: Cyberwave.white,
    fontSize: 12,
    fontWeight: '700',
  },

  // SECTION TITLES
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Cyberwave.midnightInk,
    letterSpacing: -0.2,
  },
  typePillBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  typePillBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  requiredNotice: {
    fontSize: 12,
    color: Cyberwave.mutedSlate,
  },

  // POST TYPES HORIZONTAL SCROLL
  postTypesScrollView: {
    marginBottom: 20,
  },
  postTypesScrollContent: {
    paddingRight: 20,
    gap: 12,
  },
  typeCard: {
    width: 140,
    backgroundColor: Cyberwave.white,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1.5,
    borderColor: Cyberwave.lightBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  typeCardSelected: {
    backgroundColor: '#FFFFFF',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  typeCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  typeCardIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeSelectedCheckmark: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeSelectedCheckmarkText: {
    color: Cyberwave.white,
    fontSize: 11,
    fontWeight: '800',
  },
  typeUnselectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  typeCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Cyberwave.midnightInk,
    marginBottom: 2,
  },
  typeCardBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: Cyberwave.mutedSlate,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  typeCardDescription: {
    fontSize: 11,
    color: Cyberwave.mutedSlate,
    lineHeight: 14,
  },

  // DYNAMIC FORM CARD
  formCard: {
    backgroundColor: Cyberwave.white,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: Cyberwave.lightBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Cyberwave.midnightInk,
    marginBottom: 8,
  },
  requiredAsterisk: {
    color: '#EF4444',
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Cyberwave.lightBorder,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Cyberwave.midnightInk,
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  textAreaInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Cyberwave.lightBorder,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Cyberwave.midnightInk,
    minHeight: 90,
  },

  // Currency / Price Input
  priceInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Cyberwave.lightBorder,
    overflow: 'hidden',
  },
  currencyPrefixBox: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRightWidth: 1,
    borderRightColor: Cyberwave.lightBorder,
  },
  currencyPrefixText: {
    fontSize: 15,
    fontWeight: '700',
    color: Cyberwave.midnightInk,
  },
  textInputWithPrefix: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Cyberwave.midnightInk,
  },

  // Chips
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipButton: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipButtonActive: {
    backgroundColor: '#EFF6FF',
    borderColor: Cyberwave.electricBlue,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Cyberwave.mutedSlate,
  },
  chipTextActive: {
    color: Cyberwave.electricBlue,
    fontWeight: '700',
  },

  // Image Upload Placeholder
  imageUploadPlaceholderCard: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  imagePlaceholderIcon: {
    fontSize: 26,
    marginBottom: 6,
  },
  imagePlaceholderTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Cyberwave.midnightInk,
    marginBottom: 2,
  },
  imagePlaceholderSubtitle: {
    fontSize: 11,
    color: Cyberwave.mutedSlate,
    textAlign: 'center',
  },

  // PUBLISH BUTTON
  publishButton: {
    backgroundColor: Cyberwave.electricBlue,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: Cyberwave.electricBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  publishButtonText: {
    color: Cyberwave.white,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  disclaimerContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  disclaimerText: {
    fontSize: 11,
    color: Cyberwave.mutedSlate,
    textAlign: 'center',
  },

  // MODAL STYLES
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: Cyberwave.white,
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  successIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ECFDF5',
    borderWidth: 2,
    borderColor: '#A7F3D0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  successEmoji: {
    fontSize: 28,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Cyberwave.midnightInk,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: Cyberwave.mutedSlate,
    textAlign: 'center',
    marginBottom: 16,
  },
  publishedSummaryCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Cyberwave.lightBorder,
    marginBottom: 14,
  },
  publishedTitleRow: {
    marginBottom: 4,
  },
  publishedTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Cyberwave.midnightInk,
  },
  publishedMeta: {
    fontSize: 12,
    color: Cyberwave.mutedSlate,
  },
  sessionNoticeBox: {
    width: '100%',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 18,
  },
  sessionNoticeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Cyberwave.electricBlue,
    marginBottom: 2,
  },
  sessionNoticeBody: {
    fontSize: 11,
    color: '#1E40AF',
    lineHeight: 15,
  },
  modalActionRow: {
    width: '100%',
    gap: 10,
  },
  modalPrimaryBtn: {
    backgroundColor: Cyberwave.electricBlue,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  modalPrimaryBtnText: {
    color: Cyberwave.white,
    fontSize: 14,
    fontWeight: '700',
  },
  modalSecondaryBtn: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalSecondaryBtnText: {
    color: Cyberwave.midnightInk,
    fontSize: 13,
    fontWeight: '600',
  },
  modalTextBtn: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  modalTextBtnLabel: {
    color: Cyberwave.mutedSlate,
    fontSize: 13,
    fontWeight: '500',
  },

  // Interactions
  pressedOpacity: {
    opacity: 0.8,
  },
  pressedCardOpacity: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  pressedButtonOpacity: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
});
