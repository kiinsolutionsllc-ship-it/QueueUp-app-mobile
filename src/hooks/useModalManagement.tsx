import { useState, useCallback } from 'react';
import { ModalState, UseModalManagementReturn } from '../types/JobTypes';

interface UseModalManagementProps {
  initialState?: Partial<ModalState>;
  onModalChange?: (modalType: keyof ModalState, isVisible: boolean) => void;
}

export const useModalManagement = ({
  initialState = {},
  onModalChange,
}: UseModalManagementProps = {}): UseModalManagementReturn => {
  
  const [modalState, setModalState] = useState<ModalState>({
    isSubcategoryModalVisible: false,
    isPaymentModalVisible: false,
    isImageOptionsModalVisible: false,
    isPaymentProcessing: false,
    paymentError: null,
    ...initialState,
  });

  // Show modal
  const showModal = useCallback((modalType: keyof ModalState) => {
    setModalState(prev => {
      const newState = {
        ...prev,
        [modalType]: true,
      };
      
      // Reset payment error when showing payment modal
      if (modalType === 'isPaymentModalVisible') {
        newState.paymentError = null;
      }
      
      onModalChange?.(modalType, true);
      return newState;
    });
  }, [onModalChange]);

  // Hide modal
  const hideModal = useCallback((modalType: keyof ModalState) => {
    setModalState(prev => {
      const newState = {
        ...prev,
        [modalType]: false,
      };
      
      // Reset payment processing when hiding payment modal
      if (modalType === 'isPaymentModalVisible') {
        newState.isPaymentProcessing = false;
        newState.paymentError = null;
      }
      
      onModalChange?.(modalType, false);
      return newState;
    });
  }, [onModalChange]);

  // Toggle modal
  const toggleModal = useCallback((modalType: keyof ModalState) => {
    const isCurrentlyVisible = modalState[modalType];
    if (isCurrentlyVisible) {
      hideModal(modalType);
    } else {
      showModal(modalType);
    }
  }, [modalState, showModal, hideModal]);

  // Set payment error
  const setPaymentError = useCallback((error: string | null) => {
    setModalState(prev => ({
      ...prev,
      paymentError: error,
      isPaymentProcessing: false,
    }));
  }, []);

  // Set payment processing state
  const setPaymentProcessing = useCallback((isProcessing: boolean) => {
    setModalState(prev => ({
      ...prev,
      isPaymentProcessing: isProcessing,
      paymentError: isProcessing ? null : prev.paymentError,
    }));
  }, []);

  // Hide all modals
  const hideAllModals = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      isSubcategoryModalVisible: false,
      isPaymentModalVisible: false,
      isImageOptionsModalVisible: false,
      isPaymentProcessing: false,
      paymentError: null,
    }));
  }, []);

  // Check if any modal is visible
  const isAnyModalVisible = useCallback(() => {
    return Object.values(modalState).some(value => 
      typeof value === 'boolean' ? value : false
    );
  }, [modalState]);

  // Get visible modal count
  const getVisibleModalCount = useCallback(() => {
    return Object.values(modalState).filter(value => 
      typeof value === 'boolean' ? value : false
    ).length;
  }, [modalState]);

  // Reset all modal states
  const resetModals = useCallback(() => {
    setModalState({
      isSubcategoryModalVisible: false,
      isPaymentModalVisible: false,
      isImageOptionsModalVisible: false,
      isPaymentProcessing: false,
      paymentError: null,
    });
  }, []);

  // Modal state helpers
  const modalHelpers = {
    isSubcategoryModalOpen: modalState.isSubcategoryModalVisible,
    isPaymentModalOpen: modalState.isPaymentModalVisible,
    isImageOptionsModalOpen: modalState.isImageOptionsModalVisible,
    isPaymentInProgress: modalState.isPaymentProcessing,
    hasPaymentError: !!modalState.paymentError,
  };

  return {
    modalState,
    showModal,
    hideModal,
    toggleModal,
    setPaymentError,
    setPaymentProcessing,
    hideAllModals,
    isAnyModalVisible,
    getVisibleModalCount,
    resetModals,
    ...modalHelpers,
  };
};

export default useModalManagement;
