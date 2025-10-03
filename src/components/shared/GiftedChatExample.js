import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { GiftedChat, Bubble, InputToolbar, Send, Composer, Actions, Time, Avatar, SystemMessage } from 'react-native-gifted-chat';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Example component showing how to use react-native-gifted-chat
 * with custom styling and features
 */
const GiftedChatExample = () => {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();
  
  const [messages, setMessages] = useState([
    {
      _id: 1,
      text: 'Hello! How can I help you today?',
      createdAt: new Date(),
      user: {
        _id: 2,
        name: 'Support',
        avatar: 'https://placeimg.com/140/140/any',
      },
    },
    {
      _id: 2,
      text: 'I need help with my car repair',
      createdAt: new Date(),
      user: {
        _id: 1,
        name: 'You',
        avatar: 'https://placeimg.com/140/140/any',
      },
    },
  ]);

  const onSend = useCallback((messages = []) => {
    setMessages(previousMessages =>
      GiftedChat.append(previousMessages, messages)
    );
  }, []);

  const renderBubble = useCallback((props) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          left: {
            backgroundColor: theme.surface,
            borderRadius: 18,
            borderBottomLeftRadius: 4,
          },
          right: {
            backgroundColor: theme.accent,
            borderRadius: 18,
            borderBottomRightRadius: 4,
          },
        }}
        textStyle={{
          left: {
            color: theme.text,
          },
          right: {
            color: 'white',
          },
        }}
        renderTime={(timeProps) => (
          <Time
            {...timeProps}
            timeTextStyle={{
              left: {
                color: theme.textSecondary,
              },
              right: {
                color: 'rgba(255, 255, 255, 0.7)',
              },
            }}
          />
        )}
        renderTicks={(tickProps) => {
          const { currentMessage, user } = tickProps;
          if (currentMessage.user._id === user._id) {
            return (
              <View style={styles.tickContainer}>
                <Ionicons name="checkmark-done" size={12} color={theme.accent} />
              </View>
            );
          }
          return null;
        }}
        onLongPress={(context, message) => {
          Alert.alert('Message Options', 'Long press detected!');
        }}
      />
    );
  }, [theme]);

  const renderInputToolbar = useCallback((props) => {
    return (
      <InputToolbar
        {...props}
        containerStyle={[styles.inputToolbar, { backgroundColor: theme.surface, borderTopColor: theme.border }]}
        primaryStyle={styles.inputToolbarPrimary}
        renderComposer={(composerProps) => (
          <Composer
            {...composerProps}
            textInputStyle={[styles.composerTextInput, { color: theme.text }]}
            placeholderTextColor={theme.textSecondary}
            multiline
            maxLength={1000}
          />
        )}
        renderSend={(sendProps) => (
          <Send
            {...sendProps}
            containerStyle={styles.sendContainer}
            children={
              <View style={[styles.sendButton, { backgroundColor: theme.accent }]}>
                <Ionicons name="send" size={20} color="white" />
              </View>
            }
          />
        )}
        renderActions={(actionsProps) => (
          <Actions
            {...actionsProps}
            containerStyle={styles.actionsContainer}
            onPressActionButton={() => {
              Alert.alert('Attachments', 'Attachment menu would open here');
            }}
            icon={() => (
              <View style={[styles.attachmentButton, { backgroundColor: theme.accent }]}>
                <Ionicons name="add" size={20} color="white" />
              </View>
            )}
          />
        )}
      />
    );
  }, [theme]);

  const renderAvatar = useCallback((props) => {
    const { currentMessage, user } = props;
    const isOwnMessage = currentMessage.user._id === user._id;
    
    if (isOwnMessage) return null;

    return (
      <Avatar
        {...props}
        containerStyle={styles.avatarContainer}
        textStyle={styles.avatarText}
        imageStyle={styles.avatarImage}
      />
    );
  }, []);

  const renderSystemMessage = useCallback((props) => {
    return (
      <SystemMessage
        {...props}
        containerStyle={styles.systemMessageContainer}
        textStyle={[styles.systemMessageText, { color: theme.textSecondary }]}
      />
    );
  }, [theme]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={{
          _id: 1,
          name: 'You',
          avatar: 'https://placeimg.com/140/140/any',
        }}
        renderBubble={renderBubble}
        renderInputToolbar={renderInputToolbar}
        renderAvatar={renderAvatar}
        renderSystemMessage={renderSystemMessage}
        placeholder="Type a message..."
        alwaysShowSend
        scrollToBottom
        infiniteScroll
        renderLoadEarlier={() => (
          <View style={styles.loadEarlierContainer}>
            <Ionicons name="refresh" size={16} color={theme.accent} />
          </View>
        )}
        renderScrollToBottomComponent={() => (
          <View style={[styles.scrollToBottom, { backgroundColor: theme.accent }]}>
            <Ionicons name="chevron-down" size={20} color="white" />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputToolbar: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputToolbarPrimary: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  composerTextInput: {
    fontSize: 16,
    lineHeight: 20,
    minHeight: 20,
    maxHeight: 120,
  },
  sendContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  attachmentButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarContainer: {
    marginHorizontal: 8,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  avatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  systemMessageContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  systemMessageText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  loadEarlierContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  scrollToBottom: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  tickContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },
});

export default GiftedChatExample;
