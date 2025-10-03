import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Svg, { 
  Rect, 
  Circle, 
  Path, 
  Defs, 
  RadialGradient, 
  LinearGradient, 
  Stop, 
  Filter, 
  FeDropShadow,
  G 
} from 'react-native-svg';

interface LogoProps {
  size?: number;
  style?: ViewStyle;
  showBackground?: boolean;
  variant?: 'default' | 'minimal' | 'icon';
}

const Logo: React.FC<LogoProps> = ({ 
  size = 100, 
  style, 
  showBackground = true,
  variant = 'default' 
}) => {
  const scale = size / 100;
  const center = size / 2;
  
  const renderGear = () => (
    <G transform={`translate(${center}, ${center})`}>
      {/* Gear teeth */}
      <G fill="url(#gearGradient)" filter="url(#shadow)">
        {/* Top tooth */}
        <Rect 
          x={-8 * scale} 
          y={-60 * scale} 
          width={16 * scale} 
          height={30 * scale} 
          rx={8 * scale}
        />
        {/* Bottom tooth */}
        <Rect 
          x={-8 * scale} 
          y={30 * scale} 
          width={16 * scale} 
          height={30 * scale} 
          rx={8 * scale}
        />
        {/* Left tooth */}
        <Rect 
          x={-60 * scale} 
          y={-8 * scale} 
          width={30 * scale} 
          height={16 * scale} 
          rx={8 * scale}
        />
        {/* Right tooth */}
        <Rect 
          x={30 * scale} 
          y={-8 * scale} 
          width={30 * scale} 
          height={16 * scale} 
          rx={8 * scale}
        />
        {/* Diagonal teeth */}
        <Rect 
          x={-42 * scale} 
          y={-42 * scale} 
          width={16 * scale} 
          height={30 * scale} 
          rx={8 * scale} 
          transform={`rotate(45)`}
        />
        <Rect 
          x={26 * scale} 
          y={-42 * scale} 
          width={16 * scale} 
          height={30 * scale} 
          rx={8 * scale} 
          transform={`rotate(-45)`}
        />
        <Rect 
          x={-42 * scale} 
          y={26 * scale} 
          width={16 * scale} 
          height={30 * scale} 
          rx={8 * scale} 
          transform={`rotate(-45)`}
        />
        <Rect 
          x={26 * scale} 
          y={26 * scale} 
          width={16 * scale} 
          height={30 * scale} 
          rx={8 * scale} 
          transform={`rotate(45)`}
        />
      </G>
      
      {/* Gear center circle */}
      <Circle 
        cx={0} 
        cy={0} 
        r={30 * scale} 
        fill="url(#gearGradient)" 
        filter="url(#shadow)"
      />
      <Circle 
        cx={0} 
        cy={0} 
        r={20 * scale} 
        fill="#000000"
      />
    </G>
  );

  const renderWrench = () => (
    <G transform={`translate(${center}, ${center}) rotate(45)`}>
      <G fill="url(#wrenchGradient)" filter="url(#shadow)">
        {/* Wrench head (open end) */}
        <Path 
          d={`M ${-30 * scale} ${-10 * scale} L ${-20 * scale} ${-10 * scale} L ${-20 * scale} ${-5 * scale} L ${-15 * scale} ${-5 * scale} L ${-15 * scale} ${5 * scale} L ${-20 * scale} ${5 * scale} L ${-20 * scale} ${10 * scale} L ${-30 * scale} ${10 * scale} L ${-30 * scale} ${7.5 * scale} L ${-25 * scale} ${7.5 * scale} L ${-25 * scale} ${-7.5 * scale} L ${-30 * scale} ${-7.5 * scale} Z`}
        />
        
        {/* Wrench handle */}
        <Rect 
          x={-10 * scale} 
          y={-4 * scale} 
          width={60 * scale} 
          height={8 * scale} 
          rx={4 * scale}
        />
        
        {/* Wrench handle end */}
        <Circle 
          cx={50 * scale} 
          cy={0} 
          r={6 * scale}
        />
      </G>
    </G>
  );

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          {/* Gradient for 3D effect on gear */}
          <RadialGradient id="gearGradient" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#FFD700" stopOpacity="1" />
            <Stop offset="70%" stopColor="#FFA500" stopOpacity="1" />
            <Stop offset="100%" stopColor="#FF8C00" stopOpacity="1" />
          </RadialGradient>
          
          {/* Gradient for 3D effect on wrench */}
          <LinearGradient id="wrenchGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FF8C00" stopOpacity="1" />
            <Stop offset="50%" stopColor="#FF4500" stopOpacity="1" />
            <Stop offset="100%" stopColor="#DC143C" stopOpacity="1" />
          </LinearGradient>
          
          {/* Shadow filter */}
          <Filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <FeDropShadow 
              dx={2 * scale} 
              dy={2 * scale} 
              stdDeviation={3 * scale} 
              floodColor="#000000" 
              floodOpacity="0.3"
            />
          </Filter>
        </Defs>
        
        {/* Black rounded square background */}
        {showBackground && (
          <Rect 
            x={size * 0.1} 
            y={size * 0.1} 
            width={size * 0.8} 
            height={size * 0.8} 
            rx={size * 0.1} 
            ry={size * 0.1} 
            fill="#000000"
          />
        )}
        
        {/* Render gear and wrench */}
        {renderGear()}
        {renderWrench()}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Logo;


