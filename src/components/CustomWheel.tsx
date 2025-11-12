// ---------------------------------------------
// 🎡 CustomWheel.tsx — lightweight spinning wheel
// ---------------------------------------------
import React, {
  useRef,
  useImperativeHandle,
  forwardRef,
  useState,
} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Image,
} from 'react-native';
import Svg, { G, Path, Text as SvgText, Circle } from 'react-native-svg';
import pinIcon from '../assets/images/pin.png';

export interface CustomWheelRef {
  spin: () => void;
  spinToSegment: (index: number) => void;
}

interface Props {
  segments: { text: string }[];
  segColors: string[];
  size?: number;
  duration?: number;
  onFinished?: (segment: { text: string }) => void;
  buttonText?: string;
  showButton?: boolean;
  onButtonPress?: () => void;
}

const CustomWheel = forwardRef<CustomWheelRef, Props>(
  (
    {
      segments,
      segColors,
      size = 300,
      duration = 5000,
      onFinished,
      buttonText = 'SPIN',
      showButton = true,
      onButtonPress,
    },
    ref,
  ) => {
    const animatedRotation = useRef(new Animated.Value(0)).current;
    const [isSpinning, setIsSpinning] = useState(false);

    const numSegments = segments.length;
    const anglePerSegment = 360 / numSegments;

    // 🔹 Generate SVG paths for each segment
    const createSegmentPath = (index: number) => {
      const startAngle = (index * 2 * Math.PI) / numSegments;
      const endAngle = ((index + 1) * 2 * Math.PI) / numSegments;
      const largeArcFlag = endAngle - startAngle <= Math.PI ? 0 : 1;
      const r = size / 2;
      const x1 = r + r * Math.cos(startAngle);
      const y1 = r + r * Math.sin(startAngle);
      const x2 = r + r * Math.cos(endAngle);
      const y2 = r + r * Math.sin(endAngle);
      return `M${r},${r} L${x1},${y1} A${r},${r} 0 ${largeArcFlag} 1 ${x2},${y2} Z`;
    };

    // 🔹 Spin the wheel randomly
    const spin = () => {
      if (isSpinning) return;
      setIsSpinning(true);

      const randomIndex = Math.floor(Math.random() * numSegments);
      spinToSegment(randomIndex);
    };

    // 🔹 Spin to a specific segment
    const spinToSegment = (index: number) => {
      if (isSpinning) return;
      setIsSpinning(true);

      const finalRotation =
        360 * 10 + index * anglePerSegment + anglePerSegment / 2;

      Animated.timing(animatedRotation, {
        toValue: finalRotation,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        setIsSpinning(false);
        const selectedSegment = segments[index];
        onFinished?.(selectedSegment);
      });
    };

    // 🔹 Expose ref functions
    useImperativeHandle(ref, () => ({
      spin,
      spinToSegment,
    }));

    const rotationInterpolate = animatedRotation.interpolate({
      inputRange: [0, 360],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <View style={styles.wrapper}>
        <Animated.View
          style={{
            transform: [{ rotate: rotationInterpolate }],
          }}
        >
          <Svg width={size} height={size}>
            <G>
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={size / 2 - 2}
                stroke="#fff"
                strokeWidth={4}
                fill="none"
              />
              {segments.map((seg, i) => (
                <Path
                  key={i}
                  d={createSegmentPath(i)}
                  fill={segColors[i % segColors.length]}
                  stroke="#fff"
                  strokeWidth={2}
                />
              ))}
              {segments.map((seg, i) => {
                const angle = (i + 0.5) * anglePerSegment;
                const r = size / 2 - 40;
                const x = size / 2 + r * Math.cos((angle * Math.PI) / 180);
                const y = size / 2 + r * Math.sin((angle * Math.PI) / 180);
                return (
                  <SvgText
                    key={`text-${i}`}
                    x={x}
                    y={y}
                    fontSize="12"
                    fill="#fff"
                    fontWeight="bold"
                    textAnchor="middle"
                    transform={`rotate(${angle},${x},${y})`}
                  >
                    {seg.text}
                  </SvgText>
                );
              })}
              <Circle cx={size / 2} cy={size / 2} r={5} fill="#fff" />
            </G>
          </Svg>
        </Animated.View>
        <Image
          source={pinIcon}
          style={{
            position: 'absolute',
            top: -20,
            width: 40,
            height: 40,
            resizeMode: 'contain',
          }}
        />
        {showButton && (
          <TouchableOpacity
            disabled={isSpinning}
            onPress={onButtonPress ? onButtonPress : spin}
            style={[styles.button, isSpinning && { opacity: 0.5 }]}
          >
            <Text style={styles.buttonText}>
              {isSpinning ? 'Spinning...' : buttonText}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#5da3ffff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 30,
  },
  buttonText: {
    color: '#101031',
    fontWeight: '700',
  },
});

export default CustomWheel;
