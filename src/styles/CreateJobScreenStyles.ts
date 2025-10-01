import { StyleSheet, Dimensions } from 'react-native';
import { Theme } from '../types/ThemeTypes';

const { width, height } = Dimensions.get('window');

export const createJobStyles = (theme: Theme) => StyleSheet.create({
  // Main container styles - Ultra Modern
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  
  // Header styles - Compact Design
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
    backgroundColor: theme.surface,
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
    flex: 1,
    textAlign: 'center',
    letterSpacing: -0.3,
    lineHeight: 22,
  },
  
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.surfaceVariant,
    borderWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  
  // Step progress styles - Compact
  stepProgressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: theme.surface,
  },
  
  stepProgressBar: {
    height: 6,
    backgroundColor: theme.border,
    borderRadius: 3,
    marginBottom: 12,
    overflow: 'hidden',
  },
  
  stepProgressFill: {
    height: '100%',
    backgroundColor: theme.primary,
    borderRadius: 3,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  
  stepText: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  
  // Content styles - Ultra Modern
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    paddingBottom: 140,
  },
  
  // Step content styles - Stunning Design
  stepContainer: {
    flex: 1,
    paddingVertical: 32,
  },
  
  stepTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: theme.text,
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: -1.5,
    lineHeight: 42,
  },
  
  stepSubtitle: {
    fontSize: 18,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 28,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  
  // Card styles - Ultra Modern
  card: {
    backgroundColor: theme.surface,
    borderRadius: 24,
    padding: 28,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 0,
  },
  
  cardPressed: {
    transform: [{ scale: 0.98 }],
    shadowOpacity: 0.15,
    shadowRadius: 32,
    elevation: 12,
  },
  
  // Service type selection styles - Ultra Modern
  serviceTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 20,
  },
  
  serviceTypeCard: {
    flex: 1,
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 0,
    backgroundColor: theme.surfaceVariant,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  
  serviceTypeCardSelected: {
    backgroundColor: theme.primary + '10',
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  
  serviceTypeIcon: {
    marginBottom: 20,
  },
  
  serviceTypeTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.text,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.4,
  },
  
  serviceTypeDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
  },
  
  // Vehicle selection styles - Ultra Modern
  vehicleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  
  vehicleCard: {
    width: (width - 88) / 2,
    marginBottom: 20,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 0,
    backgroundColor: theme.surfaceVariant,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  
  vehicleCardSelected: {
    backgroundColor: theme.primary + '10',
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  
  vehicleIcon: {
    marginBottom: 16,
  },
  
  vehicleName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.text,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  
  // Category selection styles
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  categoryCard: {
    width: (width - 60) / 2,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.border,
  },
  
  categoryCardSelected: {
    borderColor: theme.primary,
    backgroundColor: theme.primary + '10',
  },
  
  categoryIcon: {
    marginBottom: 12,
  },
  
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  
  categoryPrice: {
    fontSize: 12,
    color: theme.textSecondary,
    textAlign: 'center',
  },
  
  // Form input styles - Ultra Modern
  inputContainer: {
    marginBottom: 24,
  },
  
  inputLabel: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.text,
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  
  textInput: {
    borderWidth: 2,
    borderColor: theme.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: theme.text,
    backgroundColor: theme.surface,
    minHeight: 56,
  },
  
  textInputFocused: {
    borderColor: theme.primary,
  },
  
  textInputError: {
    borderColor: theme.error,
  },
  
  textArea: {
    borderWidth: 2,
    borderColor: theme.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: theme.text,
    backgroundColor: theme.surface,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  
  // Photo styles
  photoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  
  photoItem: {
    width: (width - 80) / 3,
    height: (width - 80) / 3,
    marginRight: 10,
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  
  photo: {
    width: '100%',
    height: '100%',
  },
  
  addPhotoButton: {
    width: (width - 80) / 3,
    height: (width - 80) / 3,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.surface,
  },
  
  addPhotoText: {
    fontSize: 12,
    color: theme.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  
  // Review styles
  reviewContainer: {
    flex: 1,
  },
  
  reviewSection: {
    marginBottom: 24,
  },
  
  reviewSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 12,
  },
  
  reviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  
  reviewItemLabel: {
    fontSize: 14,
    color: theme.textSecondary,
    flex: 1,
  },
  
  reviewItemValue: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.text,
    textAlign: 'right',
  },
  
  // Payment styles
  paymentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  paymentAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: theme.primary,
    marginBottom: 8,
  },
  
  paymentDescription: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  
  // Button styles - Ultra Modern
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: theme.surface,
    borderTopWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
  
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20,
  },
  
  button: {
    flex: 1,
    paddingVertical: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 64,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  
  primaryButton: {
    backgroundColor: theme.primary,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  
  primaryButtonDisabled: {
    backgroundColor: theme.textDisabled,
    opacity: 0.8,
    shadowOpacity: 0.1,
  },
  
  secondaryButton: {
    backgroundColor: theme.surfaceVariant,
    borderWidth: 2,
    borderColor: theme.border,
    shadowOpacity: 0.08,
  },
  
  buttonText: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.onPrimary,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  
  secondaryButtonText: {
    color: theme.text,
    fontWeight: '700',
  },
  
  // Navigation styles
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: theme.surface,
    borderTopWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    minHeight: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  
  backButton: {
    backgroundColor: theme.surfaceVariant,
    borderWidth: 1,
    borderColor: theme.border,
  },
  
  nextButton: {
    backgroundColor: theme.primary,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  
  navButtonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  
  navSpacer: {
    flex: 1,
  },
  
  headerSpacer: {
    width: 40,
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.text,
    flex: 1,
  },
  
  modalContent: {
    marginBottom: 20,
  },
  
  modalDescription: {
    fontSize: 16,
    color: theme.textSecondary,
    lineHeight: 24,
    marginBottom: 20,
  },
  
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  
  cancelButton: {
    backgroundColor: theme.surfaceVariant,
    borderWidth: 1,
    borderColor: theme.border,
  },
  
  confirmButton: {
    backgroundColor: theme.error,
  },
  
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  loadingText: {
    fontSize: 16,
    color: theme.textSecondary,
    marginTop: 16,
  },
  
  // Error styles
  errorContainer: {
    backgroundColor: theme.error + '20',
    borderWidth: 1,
    borderColor: theme.error,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  
  errorText: {
    fontSize: 14,
    color: theme.error,
    textAlign: 'center',
  },
  
  // Success styles
  successContainer: {
    backgroundColor: theme.success + '20',
    borderWidth: 1,
    borderColor: theme.success,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  
  successText: {
    fontSize: 14,
    color: theme.success,
    textAlign: 'center',
  },
  
  
  // Accessibility styles
  focusable: {
    borderWidth: 2,
    borderColor: 'transparent',
  },
  
  focused: {
    borderColor: theme.primary,
  },
  
  // Animation styles
  animatedCard: {
    transform: [{ scale: 1 }],
  },
  
  animatedCardPressed: {
    transform: [{ scale: 0.98 }],
  },
  
  // Responsive styles
  smallScreen: {
    paddingHorizontal: 16,
  },
  
  largeScreen: {
    paddingHorizontal: 32,
  },

  // VehicleServiceStep specific styles
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  sectionContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.text,
    marginBottom: 20,
    letterSpacing: -0.4,
  },
  serviceTypeContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  benefitsContainer: {
    marginTop: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  benefitText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    flex: 1,
    color: theme.textSecondary,
  },
  vehicleContent: {
    alignItems: 'center',
  },
  vehicleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  summarySection: {
    marginTop: 24,
  },
  summaryCard: {
    backgroundColor: theme.success + '10',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.success + '30',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.success + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.success,
    flex: 1,
  },
  summaryContent: {
    marginTop: 8,
  },
  summaryText: {
    fontSize: 15,
    color: theme.success,
    fontWeight: '600',
    lineHeight: 22,
  },
});

export default createJobStyles;
