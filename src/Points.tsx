import React from 'react';
import { useMemo, useRef, useEffect, useState } from 'react';
import { Vector3 } from 'three';
import { useSelect, useCursor } from '@react-three/drei';

type PointMeshProps = {
  /**
   * The radius of the point.
   * @default 0.01
   */
  radius?: number;
  /**
   * The color of the point
   * @default #fffff
   */
  color?: string;
  /**
   * The color of the point
   */
  scale?: number;
};

type PointBaseProps = {
  metaData: any;
  position: [number, number, number] | [number, number];
};

type PointProps = PointMeshProps &
  PointBaseProps & { selectedProps?: PointMeshProps };

/**
 * Have to provide a default mesh properties, otherwise the point will not get restored after selection
 */
const defaultPointMeshProps: PointMeshProps = { scale: 1 };

function Point({
  radius = 0.01,
  color = '#ffffff',
  metaData,
  position: propsPosition,
  selectedProps,
  ...meshProps
}: PointProps) {
  /**
   * Normalize the position (alternatively hoist higher)
   */
  const position = useMemo(() => {
    const [x, y, z = 0] = propsPosition;
    return [x, y, z] as unknown as Vector3;
  }, [propsPosition]);

  // This reference gives us direct access to the THREE.Mesh object
  const ref = useRef(null);
  // Return the view, these are regular Threejs elements expressed in JSX
  const selected = useSelect();

  const isSelected = useMemo(
    // @ts-ignore
    () => !!selected.find((sel) => sel.uuid === ref.current?.uuid),
    [ref.current, selected]
  );

  /**
   * Compute the mesh properties based on the selected state
   */
  const props = useMemo(() => {
    return isSelected
      ? { ...defaultPointMeshProps, ...meshProps, ...selectedProps }
      : { ...defaultPointMeshProps, ...meshProps };
  }, [meshProps, selectedProps, isSelected]);

  // For now assume all points are selectable
  const [hovered, setHovered] = useState<boolean>(false);
  useCursor(hovered /*'pointer', 'auto'*/);

  useEffect(() => {
    if (ref.current) {
      // attach custom metaData via monkey patching
      // @ts-ignore
      ref.current.metaData = metaData;
    }
  }, [ref, metaData]);

  return (
    <mesh
      {...props}
      position={position}
      ref={ref}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[radius, 32, 16]} />
      <meshStandardMaterial
        color={isSelected ? selectedProps?.color || 'lime' : color}
      />
    </mesh>
  );
}

export type PointsProps = {
  data: Array<PointBaseProps>;
  pointProps?: PointMeshProps;
  /**
   * Additional props that will be merged with point props when the point is selected
   */
  selectedPointProps?: PointMeshProps;
};

export function Points({ data, pointProps, selectedPointProps }: PointsProps) {
  return (
    <>
      {data.map((point, i) => (
        <Point
          {...pointProps}
          selectedProps={selectedPointProps}
          {...point}
          key={i}
        />
      ))}
    </>
  );
}
