# Archived Screens

This directory contains screens that have been archived for future reference or potential future use.

## Archived Screens

### CustomerDataExportScreen.tsx
- **Purpose**: Allows customers to export their data (job history, vehicle information, etc.) for backup or transfer purposes
- **Status**: Archived - Feature was enabled but screen moved to archive for future GDPR compliance implementation
- **Original Location**: `src/screens/customer/CustomerDataExportScreen.tsx`

### CustomerServiceScreen.tsx
- **Purpose**: Provides customer service interface for contacting support, viewing help articles, and managing support tickets
- **Status**: Archived - Feature was enabled but screen moved to archive for future customer support implementation
- **Original Location**: `src/screens/customer/CustomerServiceScreen.tsx`

### ExportHistoryScreen.tsx
- **Purpose**: Shows history of data exports and allows users to download previously exported data
- **Status**: Archived - Was integrated into settings but moved to archive for future reference
- **Original Location**: `src/screens/shared/ExportHistoryScreen.tsx`

## Notes

- These screens are fully functional and can be restored if needed
- They were removed from navigation to reduce complexity
- Consider restoring them when implementing GDPR compliance or enhanced customer support features
- All navigation references have been cleaned up from the main codebase

## Restoration Process

To restore any of these screens:

1. Move the screen file back to its original location
2. Add the import statement back to the appropriate navigator
3. Add the Stack.Screen registration back to the navigator
4. Add navigation calls where needed
5. Test the functionality

## Last Updated

January 10, 2025 - Option 5 (Hybrid Approach) implementation

