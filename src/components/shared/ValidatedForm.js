import React from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useUnifiedFormValidation } from '../../hooks/useUnifiedFormValidation';
import MaterialTextInput from './MaterialTextInput';
import MaterialButton from './MaterialButton';
// Simple ValidationError component
const ValidationError = ({ errors }) => (
  <View style={styles.validationErrorContainer}>
    {errors.map((error, index) => (
      <Text key={index} style={styles.validationErrorText}>
        {error}
      </Text>
    ))}
  </View>
);
import { useTheme } from '../../contexts/ThemeContext';

const ValidatedForm = ({
  initialValues = {},
  validationRules = {},
  onSubmit,
  submitButtonText = 'Submit',
  submitButtonVariant = 'filled',
  submitButtonSize = 'large',
  children,
  style = {},
  scrollable = true,
  keyboardAvoidingView = true,
  showValidationErrors = true}) => {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();
  
  const {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    getFieldProps} = useUnifiedFormValidation({ initialValues, validationRules });

  const onFormSubmit = async () => {
    const success = await handleSubmit(onSubmit);
    return success;
  };

  const getValidationErrors = () => {
    return Object.values(errors).filter(error => error && error.length > 0);
  };

  const FormContent = () => (
    <View style={[styles.form, style]}>
      {showValidationErrors && getValidationErrors().length > 0 && (
        <ValidationError errors={getValidationErrors()} />
      )}
      
      {children({
        values,
        errors,
        touched,
        isSubmitting,
        isValid,
        handleChange,
        handleBlur,
        getFieldProps,
        MaterialTextInput: (props) => (
          <MaterialTextInput
            {...props}
            {...getFieldProps(props.name)}
            success={touched[props.name] && !errors[props.name] && values[props.name]}
          />
        ),
        MaterialButton: (props) => (
          <MaterialButton
            {...props}
            loading={isSubmitting}
            disabled={isSubmitting || !isValid}
          />
        )})}
      
      <MaterialButton
        title={submitButtonText}
        variant={submitButtonVariant}
        size={submitButtonSize}
        onPress={onFormSubmit}
        loading={isSubmitting}
        disabled={isSubmitting || !isValid}
        style={styles.submitButton}
      />
    </View>
  );

  if (keyboardAvoidingView) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {scrollable ? (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <FormContent />
          </ScrollView>
        ) : (
          <FormContent />
        )}
      </KeyboardAvoidingView>
    );
  }

  if (scrollable) {
    return (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <FormContent />
      </ScrollView>
    );
  }

  return <FormContent />;
};

// Pre-built form components for common use cases

// Login Form
export const LoginForm = ({ onSubmit, style }) => {
  const validationRules = {
    email: ['required', 'email'],
    password: ['required', { validator: 'minLength', message: 'Password must be at least 12 characters' }]};

  return (
    <ValidatedForm
      validationRules={validationRules}
      onSubmit={onSubmit}
      submitButtonText="Sign In"
      style={style}
    >
      {({ MaterialTextInput }) => (
        <>
          <MaterialTextInput
            name="email"
            label="Email Address"
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon="email"
          />
          <MaterialTextInput
            name="password"
            label="Password"
            placeholder="Enter your password"
            secureTextEntry
            leftIcon="lock"
          />
        </>
      )}
    </ValidatedForm>
  );
};

// Job Creation Form
export const JobCreationForm = ({ onSubmit, style }) => {
  const validationRules = {
    title: ['required', { validator: 'minLength', message: 'Title must be at least 5 characters' }],
    description: ['required', { validator: 'minLength', message: 'Description must be at least 20 characters' }],
    location: ['required'],
    price: ['required', 'numeric', 'positive'],
    estimatedDuration: ['numeric', 'positive']};

  return (
    <ValidatedForm
      validationRules={validationRules}
      onSubmit={onSubmit}
      submitButtonText="Create Job"
      style={style}
    >
      {({ MaterialTextInput }) => (
        <>
          <MaterialTextInput
            name="title"
            label="Job Title *"
            placeholder="e.g., Oil Change Service"
            leftIcon="work"
          />
          <MaterialTextInput
            name="description"
            label="Description *"
            placeholder="Describe what needs to be done..."
            multiline
            numberOfLines={4}
            leftIcon="description"
          />
          <MaterialTextInput
            name="location"
            label="Location *"
            placeholder="Enter service location"
            leftIcon="location-on"
          />
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <MaterialTextInput
                name="price"
                label="Price ($) *"
                placeholder="50"
                keyboardType="numeric"
                leftIcon="attach-money"
              />
            </View>
            <View style={styles.halfWidth}>
              <MaterialTextInput
                name="estimatedDuration"
                label="Duration (min)"
                placeholder="60"
                keyboardType="numeric"
                leftIcon="schedule"
              />
            </View>
          </View>
        </>
      )}
    </ValidatedForm>
  );
};

// Profile Update Form
export const ProfileUpdateForm = ({ initialValues, onSubmit, style }) => {
  const validationRules = {
    name: ['required', { validator: 'minLength', message: 'Name must be at least 2 characters' }],
    email: ['required', 'email'],
    phone: ['phone'],
    bio: [{ validator: 'maxLength', message: 'Bio must be less than 500 characters' }]};

  return (
    <ValidatedForm
      initialValues={initialValues}
      validationRules={validationRules}
      onSubmit={onSubmit}
      submitButtonText="Update Profile"
      style={style}
    >
      {({ MaterialTextInput }) => (
        <>
          <MaterialTextInput
            name="name"
            label="Full Name *"
            placeholder="Enter your full name"
            leftIcon="person"
          />
          <MaterialTextInput
            name="email"
            label="Email Address *"
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon="email"
          />
          <MaterialTextInput
            name="phone"
            label="Phone Number"
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
            leftIcon="phone"
          />
          <MaterialTextInput
            name="bio"
            label="Bio"
            placeholder="Tell us about yourself..."
            multiline
            numberOfLines={3}
            leftIcon="info"
          />
        </>
      )}
    </ValidatedForm>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1},
  scrollView: {
    flex: 1},
  scrollContent: {
    flexGrow: 1,
    padding: 16},
  form: {
    flex: 1},
  submitButton: {
    marginTop: 24},
  row: {
    flexDirection: 'row',
    gap: 12},
  halfWidth: {
    flex: 1},
  validationErrorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  validationErrorText: {
    color: '#d32f2f',
    fontSize: 14,
    marginBottom: 4,
  },
});

export default ValidatedForm;
