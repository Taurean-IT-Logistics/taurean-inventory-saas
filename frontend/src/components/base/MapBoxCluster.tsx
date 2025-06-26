import React, { HTMLAttributes, useEffect, useRef } from 'react';
import mapboxgl, { AnyLayer, Layer, Map, MapboxOptions } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames';
import { useAppContext } from 'providers/AppProvider';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';

interface MapboxProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  options: Omit<MapboxOptions, 'container'>;
  mapData?: AnyLayer[];
}

const MapboxCluster: React.FC<MapboxProps> = ({
  className,
  options,
  mapData,
  ...rest
}) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<Map | null>(null);

  const {
    config: { theme, isDark }
  } = useAppContext();

  const styles = {
    default: 'mapbox://styles/mapbox/light-v11',
    auto: isDark
      ? 'mapbox://styles/themewagon/cljzg9juf007x01pk1bepfgew'
      : 'mapbox://styles/themewagon/clj57pads001701qo25756jtw',
    light: 'mapbox://styles/themewagon/clj57pads001701qo25756jtw',
    dark: 'mapbox://styles/themewagon/cljzg9juf007x01pk1bepfgew'
  };

  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: styles[theme],
      scrollZoom: false,
      ...options
    });

    map.current?.on('load', () => {
      map.current?.addSource('earthquakes', {
        type: 'geojson',
        data: 'https://docs.mapbox.com/mapbox-gl-js/assets/earthquakes.geojson',
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
      });

      mapData?.forEach(itm => {
        if (!itm.id && !itm.type && !(itm as Layer).source) {
          console.warn('Invalid mapData item:', itm);
          return;
        }
        const layerConfig: Layer = {
          id: itm.id,
          type: itm.type,
          source: (itm as Layer).source,
          layout: (itm as Layer).layout || {},
          paint: (itm as Layer).paint || {},
          filter: (itm as Layer).filter || []
        };

        try {
          map.current?.addLayer(layerConfig as AnyLayer);
        } catch (error) {
          console.error(`Failed to add layer ${itm.id}:`, error);
        }
      });

      map.current?.on('click', 'clusters', e => {
        const features = map.current?.queryRenderedFeatures(e.point, {
          layers: ['clusters']
        });

        if (!features || features.length === 0) return;

        const clusterId = features[0].properties?.cluster_id;

        if (!clusterId) return;

        (
          map.current?.getSource('earthquakes') as mapboxgl.GeoJSONSource
        )?.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return;

          if (features[0].geometry.type === 'Point') {
            const coordinates = features[0].geometry.coordinates as [
              number,
              number
            ];

            map.current?.easeTo({
              center: coordinates,
              zoom
            });
          }
        });
      });

      map.current?.on('click', 'unclustered-point', e => {
        if (!e.features || e.features.length === 0) return;

        const feature = e.features[0];
        if (feature.geometry.type !== 'Point') return;

        const coordinates = feature.geometry.coordinates.slice();
        const { mag, tsunami } = feature.properties as {
          mag?: number;
          tsunami?: number;
        };

        if (map.current) {
          new mapboxgl.Popup()
            .setLngLat(coordinates as [number, number])
            .setHTML(
              `Magnitude: ${mag ?? 'N/A'}<br>Tsunami: ${
                tsunami === 1 ? 'yes' : 'no'
              }`
            )
            .addTo(map.current);
        }
      });

      map.current?.on('mouseenter', 'clusters', () => {
        map.current!.getCanvas().style.cursor = 'pointer';
      });

      map.current?.on('mouseleave', 'clusters', () => {
        map.current!.getCanvas().style.cursor = '';
      });
    });
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [theme, isDark, options, mapData]);

  useEffect(() => {
    map.current?.setStyle(styles[theme]);
  }, [theme]);

  return (
    <div className={classNames(className, 'mapbox-container')} {...rest}>
      <div ref={mapContainer} className="map-container" />
      <div className="mapbox-control-btn">
        <Button onClick={() => map.current?.zoomIn()} className="zoomIn">
          <FontAwesomeIcon icon={faPlus} />
        </Button>
        <Button onClick={() => map.current?.zoomOut()} className="zoomOut">
          <FontAwesomeIcon icon={faMinus} />
        </Button>
      </div>
    </div>
  );
};

export default MapboxCluster;
