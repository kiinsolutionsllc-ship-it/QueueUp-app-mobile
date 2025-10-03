import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useResponsive } from '../../hooks/useResponsive';
import ResponsiveText from './ResponsiveText';

const ResponsiveGrid = ({
  children,
  columns,
  spacing = 16,
  itemStyle,
  containerStyle,
  scrollable = false,
  ...props
}) => {
  const responsive = useResponsive();
  
  // Calculate columns based on screen size if not provided
  const gridColumns = columns || responsive.getGridColumns();
  
  // Calculate item width
  const itemWidth = responsive.getCardWidth();
  
  // Calculate spacing
  const scaledSpacing = responsive.getSpacing(spacing);
  
  // Group children into rows
  const rows = [];
  const childrenArray = children || [];
  for (let i = 0; i < childrenArray.length; i += gridColumns) {
    rows.push(childrenArray.slice(i, i + gridColumns));
  }

  const renderRow = (row, rowIndex) => (
    <View key={rowIndex} style={[styles.row, { marginBottom: scaledSpacing }]}>
      {row.map((child, colIndex) => (
        <View
          key={colIndex}
          style={[
            styles.item,
            {
              width: itemWidth,
              marginRight: colIndex < row.length - 1 ? scaledSpacing : 0},
            itemStyle,
          ]}
        >
          {child}
        </View>
      ))}
    </View>
  );

  const content = (
    <View style={[styles.container, containerStyle]}>
      {(rows || []).map(renderRow)}
    </View>
  );

  if (scrollable) {
    return (
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        {...props}
      >
        {content}
      </ScrollView>
    );
  }

  return content;
};

// Responsive card grid
export const ResponsiveCardGrid = ({
  data,
  renderItem,
  columns,
  spacing = 16,
  itemStyle,
  containerStyle,
  ...props
}) => {
  const responsive = useResponsive();
  const gridColumns = columns || responsive.getGridColumns();
  
  return (
    <ResponsiveGrid
      columns={gridColumns}
      spacing={spacing}
      itemStyle={itemStyle}
      containerStyle={containerStyle}
      {...props}
    >
      {(data || []).map((item, index) => (
        <View key={index}>
          {renderItem(item, index)}
        </View>
      ))}
    </ResponsiveGrid>
  );
};

// Responsive list
export const ResponsiveList = ({
  data,
  renderItem,
  keyExtractor,
  spacing = 16,
  itemStyle,
  containerStyle,
  ...props
}) => {
  const responsive = useResponsive();
  const scaledSpacing = responsive.getSpacing(spacing);
  
  return (
    <View style={[styles.listContainer, containerStyle]}>
      {(data || []).map((item, index) => (
        <View
          key={keyExtractor ? keyExtractor(item, index) : index}
          style={[
            styles.listItem,
            {
              marginBottom: index < (data || []).length - 1 ? scaledSpacing : 0},
            itemStyle,
          ]}
        >
          {renderItem(item, index)}
        </View>
      ))}
    </View>
  );
};

// Responsive section
export const ResponsiveSection = ({
  children,
  title,
  subtitle,
  action,
  padding = 16,
  style,
  ...props
}) => {
  const responsive = useResponsive();
  const scaledPadding = responsive.getSpacing(padding);
  
  return (
    <View style={[styles.section, { padding: scaledPadding }, style]} {...props}>
      {(title || subtitle || action) && (
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            {title && (
              <ResponsiveText variant="h6" style={styles.sectionTitle}>
                {title}
              </ResponsiveText>
            )}
            {subtitle && (
              <ResponsiveText variant="body2" style={styles.sectionSubtitle}>
                {subtitle}
              </ResponsiveText>
            )}
          </View>
          {action && (
            <View style={styles.sectionAction}>
              {action}
            </View>
          )}
        </View>
      )}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1},
  scrollContainer: {
    flex: 1},
  scrollContent: {
    flexGrow: 1},
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap'},
  item: {
    // Width and margin are set dynamically
  },
  listContainer: {
    flex: 1},
  listItem: {
    // Margin is set dynamically
  },
  section: {
    // Padding is set dynamically
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16},
  sectionTitleContainer: {
    flex: 1},
  sectionTitle: {
    marginBottom: 4},
  sectionSubtitle: {
    opacity: 0.7},
  sectionAction: {
    marginLeft: 16}});

export default ResponsiveGrid;
