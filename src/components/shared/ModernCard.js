import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import IconFallback from './IconFallback';
import { useTheme } from '../../contexts/ThemeContext';

export default function ModernCard({ 
  children, 
  style, 
  onPress,
  elevation = 2,
  padding = 16}) {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();

  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent
      style={[
        styles.card,
        {
          backgroundColor: theme.cardBackground,
          shadowColor: theme.cardShadow,
          elevation: elevation},
        style,
      ]}
      onPress={onPress}
    >
      <View style={[styles.content, { padding }]}>
        {children}
      </View>
    </CardComponent>
  );
}

export function ProjectCard({
  title,
  teamMembers = [],
  leadTime = '134 hrs.',
  budget = '12,310 $',
  iterations = 2,
  onEdit,
  onDelete,
  onPress,
  style}) {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();

  return (
    <ModernCard onPress={onPress} style={[styles.projectCard, style]}>
      <View style={styles.projectHeader}>
        <Text style={[styles.projectTitle, { color: theme.text }]}>{title}</Text>
        <View style={styles.projectActions}>
          {onEdit && (
            <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
              <IconFallback name="edit" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
              <IconFallback name="delete" size={20} color={theme.error} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Team Members */}
      <View style={styles.teamSection}>
        <View style={styles.teamAvatars}>
          {(teamMembers || []).map((member, index) => (
            <View key={index} style={styles.teamAvatarContainer}>
              <View style={[styles.teamAvatar, { backgroundColor: theme.avatarBackground }]}>
                <Text style={styles.teamAvatarText}>{member.avatar}</Text>
              </View>
              {member.status && (
                <View style={[styles.statusDot, { backgroundColor: member.statusColor || theme.success }]}>
                  <Text style={[styles.statusText, { color: theme.onPrimary }]}>
                    {member.status}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>

      {/* Task Allocation Progress */}
      <View style={styles.progressSection}>
        <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>Task allocation</Text>
        <View style={[styles.progressBar, { backgroundColor: theme.divider }]}>
          <View style={[styles.progressSegment, { backgroundColor: theme.progressGreen, flex: 0.4 }]} />
          <View style={[styles.progressSegment, { backgroundColor: theme.progressRed, flex: 0.3 }]} />
          <View style={[styles.progressSegment, { backgroundColor: theme.progressYellow, flex: 0.3 }]} />
        </View>
      </View>

      {/* Metrics */}
      <View style={styles.metricsSection}>
        <View style={styles.metricItem}>
          <Text style={[styles.metricValue, { color: theme.text }]}>{leadTime}</Text>
          <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Lead time</Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={[styles.metricValue, { color: theme.text }]}>{budget}</Text>
          <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Development budget</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.projectFooter}>
        <View style={styles.footerItem}>
          <IconFallback name="people" size={16} color={theme.textSecondary} />
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            {teamMembers.length} Team members
          </Text>
        </View>
        <View style={styles.footerItem}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            {iterations} Iterations
          </Text>
          <IconFallback name="arrow-forward" size={16} color={theme.textSecondary} />
        </View>
      </View>
    </ModernCard>
  );
}

export function LeadCard({
  name,
  role,
  project,
  avatar = '👤',
  onLinkedIn,
  onEmail,
  onPress,
  style}) {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();

  return (
    <ModernCard onPress={onPress} style={[styles.leadCard, style]}>
      <View style={styles.leadHeader}>
        <View style={[styles.leadAvatar, { backgroundColor: theme.avatarBackground }]}>
          <Text style={styles.leadAvatarText}>{avatar}</Text>
        </View>
        <View style={styles.leadAction}>
          <IconFallback name="arrow-upward" size={20} color={theme.textSecondary} />
        </View>
      </View>

      <Text style={[styles.leadName, { color: theme.text }]}>{name}</Text>
      <Text style={[styles.leadRole, { color: theme.textSecondary }]}>{role}</Text>
      <Text style={[styles.leadProject, { color: theme.textSecondary }]}>{project}</Text>

      <View style={styles.leadActions}>
        <TouchableOpacity style={[styles.leadButton, { borderColor: theme.border }]}>
          <Text style={[styles.leadButtonText, { color: theme.primary }]}>Linkedin</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.leadButton, { borderColor: theme.border }]}>
          <Text style={[styles.leadButtonText, { color: theme.primary }]}>Email</Text>
        </TouchableOpacity>
      </View>
    </ModernCard>
  );
}

export function TaskCard({
  name,
  role,
  taskTitle,
  duration = '25 min',
  date = '2025.10.10 at 2pm',
  participants = [],
  avatar = '👤',
  onPress,
  style}) {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();

  return (
    <ModernCard onPress={onPress} style={[styles.taskCard, style]}>
      <View style={styles.taskHeader}>
        <View style={[styles.taskAvatar, { backgroundColor: theme.avatarBackground }]}>
          <Text style={styles.taskAvatarText}>{avatar}</Text>
        </View>
        <View style={styles.taskActions}>
          <TouchableOpacity style={styles.taskActionButton}>
            <IconFallback name="notifications" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.taskActionButton}>
            <IconFallback name="arrow-upward" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={[styles.taskName, { color: theme.text }]}>{name}</Text>
      <Text style={[styles.taskRole, { color: theme.textSecondary }]}>{role}</Text>

      <View style={[styles.taskDetails, { backgroundColor: theme.success + '20' }]}>
        <View style={styles.taskDetailHeader}>
          <View style={[styles.taskIcon, { backgroundColor: theme.success }]}>
            <IconFallback name="folder" size={16} color={theme.onPrimary} />
          </View>
          <Text style={[styles.taskDuration, { color: theme.text }]}>{duration}</Text>
        </View>
        <View style={styles.taskParticipants}>
          {participants.map((participant, index) => (
            <View key={index} style={[styles.participantAvatar, { backgroundColor: theme.avatarBackground }]}>
              <Text style={styles.participantAvatarText}>{participant.avatar}</Text>
            </View>
          ))}
        </View>
        <Text style={[styles.taskDate, { color: theme.textSecondary }]}>{date}</Text>
      </View>
    </ModernCard>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginVertical: 4},
  content: {
    // padding handled by padding prop
  },
  projectCard: {
    marginVertical: 8},
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16},
  projectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1},
  projectActions: {
    flexDirection: 'row',
    gap: 8},
  actionButton: {
    padding: 4},
  teamSection: {
    marginBottom: 16},
  teamAvatars: {
    flexDirection: 'row',
    gap: -8},
  teamAvatarContainer: {
    position: 'relative'},
  teamAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF'},
  teamAvatarText: {
    fontSize: 14},
  statusDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'},
  statusText: {
    fontSize: 8,
    fontWeight: 'bold'},
  progressSection: {
    marginBottom: 16},
  progressLabel: {
    fontSize: 14,
    marginBottom: 8},
  progressBar: {
    height: 8,
    borderRadius: 4,
    flexDirection: 'row',
    overflow: 'hidden'},
  progressSegment: {
    height: '100%'},
  metricsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16},
  metricItem: {
    alignItems: 'center'},
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4},
  metricLabel: {
    fontSize: 12},
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'},
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4},
  footerText: {
    fontSize: 12},
  leadCard: {
    marginVertical: 4},
  leadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12},
  leadAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'},
  leadAvatarText: {
    fontSize: 18},
  leadAction: {
    padding: 4},
  leadName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4},
  leadRole: {
    fontSize: 14,
    marginBottom: 2},
  leadProject: {
    fontSize: 14,
    marginBottom: 12},
  leadActions: {
    flexDirection: 'row',
    gap: 8},
  leadButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1},
  leadButtonText: {
    fontSize: 12,
    fontWeight: '500'},
  taskCard: {
    marginVertical: 4},
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12},
  taskAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'},
  taskAvatarText: {
    fontSize: 18},
  taskActions: {
    flexDirection: 'row',
    gap: 8},
  taskActionButton: {
    padding: 4},
  taskName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4},
  taskRole: {
    fontSize: 14,
    marginBottom: 12},
  taskDetails: {
    padding: 12,
    borderRadius: 8},
  taskDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8},
  taskIcon: {
    width: 20,
    height: 20,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center'},
  taskDuration: {
    fontSize: 14,
    fontWeight: '500'},
  taskParticipants: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8},
  participantAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'},
  participantAvatarText: {
    fontSize: 12},
  taskDate: {
    fontSize: 12}});
