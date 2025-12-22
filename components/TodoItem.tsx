import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Todo } from '../hooks/useTodos';

const NEON_GREEN = '#00FF00';
const INACTIVE_NEON = '#006600';
const WHITE = 'white';
const BLACK = 'black';

interface TodoItemProps {
  todo: Todo;
  onToggleRequest: (todo: Todo) => void;
  onDeleteRequest: (todo: Todo) => void;
  onEditRequest?: (todo: Todo) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onToggleRequest,
  onDeleteRequest,
  onEditRequest,
}) => {
  const isCompleted = todo.completed;

  return (
    <View
      style={[
        styles.container,
        isCompleted && styles.containerCompleted,
      ]}
    >
      <TouchableOpacity
        onPress={() => onToggleRequest(todo)}
        style={styles.checkContainer}
      >
        {isCompleted ? (
          <FontAwesome name="check-square" size={26} color={NEON_GREEN} />
        ) : (
          <FontAwesome name="square-o" size={26} color={NEON_GREEN} />
        )}
      </TouchableOpacity>

      <View style={styles.infoContainer}>
        <Text
          style={[
            styles.title,
            isCompleted && styles.titleCompleted,
          ]}
          numberOfLines={2}
        >
          {todo.title}
        </Text>

        {todo.photoUri ? (
          <Image
            source={{ uri: todo.photoUri }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : null}

        {todo.location ? (
          <View style={styles.locationContainer}>
            <FontAwesome name="map-marker" size={14} color={NEON_GREEN} />
            <Text style={styles.locationText}>
              Lat: {todo.location.latitude.toFixed(2)}, Lon: {todo.location.longitude.toFixed(2)}
            </Text>
          </View>
        ) : null}

        <Text style={styles.statusText}>
          {isCompleted ? 'Completada' : 'Pendiente'}
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => onEditRequest?.(todo)}
        style={styles.editButton}
      >
        <FontAwesome name="edit" size={20} color={NEON_GREEN} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onDeleteRequest(todo)}
        style={styles.deleteButton}
      >
        <FontAwesome name="trash" size={22} color={INACTIVE_NEON} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: BLACK,
    borderWidth: 1,
    borderColor: NEON_GREEN,
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  containerCompleted: {
    opacity: 0.4,
  },

  checkContainer: {
    marginRight: 12,
  },

  infoContainer: {
    flex: 1,
    marginRight: 10,
  },

  title: {
    fontSize: 16,
    color: WHITE,
  },

  titleCompleted: {
    textDecorationLine: 'line-through',
    color: INACTIVE_NEON,
  },

  image: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: NEON_GREEN,
  },

  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 4,
  },

  locationText: {
    fontSize: 12,
    color: NEON_GREEN,
    marginLeft: 6,
  },

  statusText: {
    fontSize: 12,
    color: INACTIVE_NEON,
    marginTop: 2,
  },

  deleteButton: {
    padding: 5,
    marginLeft: 10,
  },

  editButton: {
    padding: 5,
    marginRight: 8,
  },

});

export default TodoItem;