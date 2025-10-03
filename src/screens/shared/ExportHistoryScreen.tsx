import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import IconFallback from '../../components/shared/IconFallback';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContextAWS';
import ModernHeader from '../../components/shared/ModernHeader';
import MaterialCard from '../../components/shared/MaterialCard';
import MaterialButton from '../../components/shared/MaterialButton';


interface ExportHistoryScreenProps {
  navigation: any;
}
export default function ExportHistoryScreen({ navigation }: ExportHistoryScreenProps) {
  const { getCurrentTheme } = useTheme();
  const { user } = useAuth();
  const theme = getCurrentTheme();
  const [isExporting, setIsExporting] = useState<any>(false);
  const [exportFormat, setExportFormat] = useState<any>('csv');
  const [dateRange, setDateRange] = useState<any>('all');

  const exportFormats = [
    { value: 'csv', label: 'CSV', description: 'Comma-separated values', icon: 'table-chart' },
    { value: 'pdf', label: 'PDF', description: 'Portable Document Format', icon: 'picture-as-pdf' },
    { value: 'excel', label: 'Excel', description: 'Microsoft Excel format', icon: 'grid-on' },
  ];

  const dateRanges = [
    { value: 'all', label: 'All Time' },
    { value: 'year', label: 'This Year' },
    { value: 'month', label: 'This Month' },
    { value: 'week', label: 'This Week' },
  ];

  const generateJobHistoryData = () => {
    // Mock data - in a real app, this would come from your API
    const mockJobs = [
      {
        id: '1',
        title: 'Oil Change Service',
        customer: 'John Smith',
        date: '2024-12-01',
        price: 75,
        status: 'completed',
        rating: 5,
      },
      {
        id: '2',
        title: 'Brake Pad Replacement',
        customer: 'Sarah Johnson',
        date: '2024-11-28',
        price: 200,
        status: 'completed',
        rating: 4,
      },
      {
        id: '3',
        title: 'Tire Rotation',
        customer: 'Mike Davis',
        date: '2024-11-25',
        price: 50,
        status: 'completed',
        rating: 5,
      },
    ];

    return mockJobs;
  };

  const generateCSV = (jobs) => {
    const headers = 'Job ID,Title,Customer,Date,Price,Status,Rating\n';
    const rows = jobs.map(job => 
      `${job.id},"${job.title}","${job.customer}",${job.date},${job.price},${job.status},${job.rating}`
    ).join('\n');
    return headers + rows;
  };

  const generatePDF = (jobs) => {
    // In a real app, you would use a PDF generation library
    return `Job History Report\n\n${jobs.map(job => 
      `Job: ${job.title}\nCustomer: ${job.customer}\nDate: ${job.date}\nPrice: $${job.price}\nStatus: ${job.status}\nRating: ${job.rating}/5\n\n`
    ).join('')}`;
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const jobs = generateJobHistoryData();
      const fileName = `job_history_${new Date().toISOString().split('T')[0]}.${exportFormat}`;
      
      let content;
      let mimeType;
      
      switch (exportFormat) {
        case 'csv':
          content = generateCSV(jobs);
          mimeType = 'text/csv';
          break;
        case 'pdf':
          content = generatePDF(jobs);
          mimeType = 'application/pdf';
          break;
        case 'excel':
          content = generateCSV(jobs); // Simplified - would use proper Excel library
          mimeType = 'application/vnd.ms-excel';
          break;
        default:
          content = generateCSV(jobs);
          mimeType = 'text/plain';
      }

      const fileUri = FileSystem.documentDirectory + fileName;
      await FileSystem.writeAsStringAsync(fileUri, content, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType,
          dialogTitle: 'Export Job History',
        });
      } else {
        Alert.alert('Export Complete', `File saved to: ${fileUri}`);
      }

      Alert.alert(
        'Export Successful',
        'Your job history has been exported successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Export Failed', 'Failed to export job history. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const renderFormatOption = (format) => (
    <TouchableOpacity
      key={format.value}
      style={[
        styles.formatOption,
        {
          backgroundColor: exportFormat === format.value ? theme.primary + '20' : theme.surface,
          borderColor: exportFormat === format.value ? theme.primary : theme.divider,
        },
      ]}
      onPress={() => setExportFormat(format.value)}
    >
      <IconFallback name={format.icon} size={24} color={exportFormat === format.value ? theme.primary : theme.textSecondary} />
      <View style={styles.formatInfo}>
        <Text style={[styles.formatLabel, { color: theme.text }]}>
          {format.label}
        </Text>
        <Text style={[styles.formatDescription, { color: theme.textSecondary }]}>
          {format.description}
        </Text>
      </View>
      {exportFormat === format.value && (
        <IconFallback name="check-circle" size={20} color={theme.primary} />
      )}
    </TouchableOpacity>
  );

  const renderDateRangeOption = (range) => (
    <TouchableOpacity
      key={range.value}
      style={[
        styles.dateRangeOption,
        {
          backgroundColor: dateRange === range.value ? theme.primary : theme.surface,
          borderColor: dateRange === range.value ? theme.primary : theme.divider,
        },
      ]}
      onPress={() => setDateRange(range.value)}
    >
      <Text
        style={[
          styles.dateRangeText,
          {
            color: dateRange === range.value ? theme.onPrimary : theme.text,
          },
        ]}
      >
        {range.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ModernHeader
        title="Export Job History"
        onBackPress={() => navigation.goBack()}
        showBack
      />
      
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>
            Export Your Job History
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Choose your preferred format and date range to export your job history data
          </Text>
        </View>

        {/* Export Format Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Export Format
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            Select the file format for your export
          </Text>
          
          <View style={styles.formatContainer}>
            {exportFormats.map(renderFormatOption)}
          </View>
        </View>

        {/* Date Range Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Date Range
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            Choose the time period for your export
          </Text>
          
          <View style={styles.dateRangeContainer}>
            {dateRanges.map(renderDateRangeOption)}
          </View>
        </View>

        {/* Export Preview */}
        <MaterialCard style={[styles.previewCard, { backgroundColor: theme.surface }]}>
          <Text style={[styles.previewTitle, { color: theme.text }]}>
            Export Preview
          </Text>
          <Text style={[styles.previewText, { color: theme.textSecondary }]}>
            • Format: {exportFormats.find(f => f.value === exportFormat)?.label}
          </Text>
          <Text style={[styles.previewText, { color: theme.textSecondary }]}>
            • Date Range: {dateRanges.find(r => r.value === dateRange)?.label}
          </Text>
          <Text style={[styles.previewText, { color: theme.textSecondary }]}>
            • Estimated Records: 25 jobs
          </Text>
        </MaterialCard>

        {/* Export Information */}
        <MaterialCard style={[styles.infoCard, { backgroundColor: theme.surface }]}>
          <View style={styles.infoHeader}>
            <IconFallback name="info" size={20} color={theme.primary} />
            <Text style={[styles.infoTitle, { color: theme.text }]}>
              Export Information
            </Text>
          </View>
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            • Exported data includes job details, customer information, and ratings
          </Text>
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            • Personal information is included as per privacy settings
          </Text>
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            • Files are saved to your device's download folder
          </Text>
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            • Large exports may take a few moments to process
          </Text>
        </MaterialCard>

        {/* Export Button */}
        <MaterialButton
          title="Export Job History"
          onPress={handleExport}
          variant="filled"
          loading={isExporting}
          disabled={isExporting}
          style={styles.exportButton}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  formatContainer: {
    gap: 12,
  },
  formatOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  formatInfo: {
    flex: 1,
    marginLeft: 12,
  },
  formatLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  formatDescription: {
    fontSize: 14,
  },
  dateRangeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  dateRangeOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  dateRangeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  previewCard: {
    padding: 16,
    marginBottom: 24,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  previewText: {
    fontSize: 14,
    marginBottom: 4,
  },
  infoCard: {
    padding: 16,
    marginBottom: 24,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  exportButton: {
    marginTop: 16,
  },
});
