import * as React from 'react';
import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Dimensions,
} from 'react-native';
import IconFallback from '../../components/shared/IconFallback';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContextAWS';
import { useVehicle } from '../../contexts/VehicleContext';
import ModernHeader from '../../components/shared/ModernHeader';


interface CarInfoScreenProps {
  navigation: any;
  route: {
    params?: any;
  };
}
export default function CarInfoScreen({ navigation, route }: CarInfoScreenProps) {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();

  // Screen mode management
  const [screenMode, setScreenMode] = useState<any>('garage'); // 'garage' or 'addVehicle'
  const [currentStep, setCurrentStep] = useState<any>(1);
  const [completedSteps, setCompletedSteps] = useState<any>([]);
  const [expandedSections, setExpandedSections] = useState<any>({
    basic: true,
    detailed: false,
    optional: false,
    service: false,
    advanced: false
  });

  const [carInfo, setCarInfo] = useState<any>({
    make: '',
    model: '',
    year: '',
    nickname: '',
    vin: '',
    mileage: '',
    color: '',
    licensePlate: '',
    trim: '',
    bodyStyle: '',
    drivetrain: '',
    engineType: '',
    transmission: '',
    fuelType: '',
    lastServiceDate: '',
    issues: '',
    serviceHistory: '',
  });

  const [loading, setLoading] = useState<any>(false);
  const [showDropdownModal, setShowDropdownModal] = useState<any>(false);
  const [showTextInputModal, setShowTextInputModal] = useState<any>(false);
  const [currentField, setCurrentField] = useState<any>('');
  const [currentOptions, setCurrentOptions] = useState<any>([]);
  const [currentPlaceholder, setCurrentPlaceholder] = useState<any>('');
  const [inputValue, setInputValue] = useState<any>('');

  // Use VehicleContext for saved vehicles
  const { vehicles: savedVehicles, addVehicle, deleteVehicle } = useVehicle();

  const carMakes = [
    'Acura', 'Alfa Romeo', 'Aston Martin', 'Audi', 'Bentley', 'BMW',
    'Buick', 'Cadillac', 'Chevrolet', 'Chrysler', 'Dodge', 'Eagle',
    'Ferrari', 'Fiat', 'Ford', 'Genesis', 'GMC', 'Honda', 'Hummer',
    'Hyundai', 'Infiniti', 'Isuzu', 'Jaguar', 'Jeep', 'Kia', 'Lamborghini',
    'Land Rover', 'Lexus', 'Lincoln', 'Lotus', 'Maserati', 'Mazda',
    'McLaren', 'Mercedes-Benz', 'Mini', 'Mitsubishi', 'Nissan', 'Oldsmobile',
    'Other', 'Plymouth', 'Pontiac', 'Porsche', 'Ram', 'Rolls-Royce', 'Saab',
    'Saturn', 'Scion', 'Smart', 'Subaru', 'Suzuki', 'Tesla', 'Toyota',
    'Volkswagen', 'Volvo'
  ];

  const carModels = {
    'Acura': ['ILX', 'Integra', 'Legend', 'MDX', 'NSX', 'RDX', 'RL', 'RLX', 'RSX', 'TL', 'TLX', 'TSX'],
    'Alfa Romeo': ['156', '159', '164', '4C', 'Brera', 'Giulia', 'GT', 'GTV', 'Spider', 'Stelvio'],
    'Aston Martin': ['DB11', 'DB7', 'DB9', 'DBS', 'Rapide', 'V8 Vantage', 'Vanquish'],
    'Audi': ['A3', 'A4', 'A6', 'A8', 'e-tron', 'Q3', 'Q5', 'Q7', 'Q8', 'R8', 'RS3', 'RS4', 'RS6', 'RS7', 'TT'],
    'Bentley': ['Arnage', 'Azure', 'Bentayga', 'Brooklands', 'Continental', 'Flying Spur', 'Mulsanne'],
    'BMW': ['3 Series', '5 Series', '7 Series', 'i3', 'i8', 'M2', 'M3', 'M4', 'M5', 'M8', 'X1', 'X3', 'X5', 'X7', 'Z4'],
    'Buick': ['Cascada', 'Enclave', 'Encore', 'Envision', 'LaCrosse', 'LeSabre', 'Park Avenue', 'Regal', 'Rendezvous', 'Verano'],
    'Cadillac': ['ATS', 'CT6', 'CTS', 'DTS', 'ELR', 'Escalade', 'SRX', 'STS', 'XLR', 'XT4', 'XT5', 'XT6', 'XTS'],
    'Chevrolet': ['Blazer', 'Camaro', 'Colorado', 'Corvette', 'Cruze', 'Equinox', 'Impala', 'Malibu', 'Silverado', 'Sonic', 'Suburban', 'Tahoe', 'Trax', 'Traverse'],
    'Chrysler': ['300', 'Aspen', 'Cirrus', 'Crossfire', 'Pacifica', 'PT Cruiser', 'Sebring', 'Town & Country', 'Voyager'],
    'Dodge': ['Avenger', 'Caliber', 'Challenger', 'Charger', 'Dart', 'Durango', 'Grand Caravan', 'Journey', 'Magnum', 'Neon', 'Stratus'],
    'Eagle': ['Premier', 'Summit', 'Talon', 'Vision'],
    'Ferrari': ['458', '488', '599', '812', 'California', 'F8', 'LaFerrari', 'Portofino', 'Roma', 'SF90'],
    'Fiat': ['124 Spider', '500', '500L', '500X', 'Bravo', 'Linea', 'Panda', 'Punto', 'Sedici'],
    'Ford': ['Bronco', 'EcoSport', 'Edge', 'Escape', 'Expedition', 'Explorer', 'F-150', 'Flex', 'Focus', 'Fusion', 'Mustang', 'Ranger', 'Taurus', 'Transit'],
    'Genesis': ['G70', 'G80', 'G90', 'GV70', 'GV80'],
    'GMC': ['Acadia', 'Canyon', 'Denali', 'Envoy', 'Jimmy', 'Savana', 'Sierra', 'Sonoma', 'Terrain', 'Yukon'],
    'Honda': ['Accord', 'Civic', 'CR-V', 'Element', 'Fit', 'HR-V', 'Insight', 'NSX', 'Odyssey', 'Passport', 'Pilot', 'Ridgeline', 'S2000'],
    'Hummer': ['H1', 'H2', 'H3', 'H3T'],
    'Hyundai': ['Accent', 'Elantra', 'Genesis', 'Ioniq', 'Kona', 'Nexo', 'Palisade', 'Santa Fe', 'Sonata', 'Tucson', 'Veloster', 'Venue'],
    'Infiniti': ['EX35', 'FX35', 'FX45', 'G35', 'G37', 'M35', 'M37', 'Q50', 'Q60', 'Q70', 'QX30', 'QX50', 'QX60', 'QX80'],
    'Isuzu': ['Amigo', 'Ascender', 'Axiom', 'i-Series', 'Impulse', 'Rodeo', 'Stylus', 'Trooper', 'VehiCROSS'],
    'Jaguar': ['E-PACE', 'F-PACE', 'F-TYPE', 'I-PACE', 'S-TYPE', 'X-TYPE', 'XE', 'XF', 'XJ', 'XK'],
    'Jeep': ['Cherokee', 'Commander', 'Compass', 'Gladiator', 'Grand Cherokee', 'Grand Wagoneer', 'Liberty', 'Patriot', 'Renegade', 'Wrangler'],
    'Kia': ['Cadenza', 'Forte', 'K900', 'Niro', 'Optima', 'Rio', 'Sedona', 'Sorento', 'Soul', 'Sportage', 'Stinger', 'Telluride'],
    'Lamborghini': ['Aventador', 'Countach', 'Diablo', 'Gallardo', 'Huracan', 'Murcielago', 'Urus'],
    'Land Rover': ['Defender', 'Discovery', 'Discovery Sport', 'Freelander', 'Range Rover', 'Range Rover Evoque', 'Range Rover Sport', 'Range Rover Velar'],
    'Lexus': ['CT', 'ES', 'GS', 'GX', 'HS', 'IS', 'LC', 'LS', 'LX', 'NX', 'RC', 'RX', 'SC', 'UX'],
    'Lincoln': ['Aviator', 'Continental', 'Corsair', 'LS', 'MKC', 'MKT', 'MKX', 'MKZ', 'Navigator', 'Town Car', 'Zephyr'],
    'Lotus': ['Elan', 'Elise', 'Europa', 'Evora', 'Exige', 'Seven', 'Esprit'],
    'Maserati': ['Coupe', 'Ghibli', 'GranCabrio', 'GranTurismo', 'Levante', 'Quattroporte', 'Spyder'],
    'Mazda': ['CX-3', 'CX-30', 'CX-5', 'CX-9', 'Mazda2', 'Mazda3', 'Mazda6', 'MPV', 'MX-5 Miata', 'RX-7', 'RX-8', 'Tribute'],
    'McLaren': ['540C', '570S', '600LT', '650S', '675LT', '720S', 'GT', 'P1', 'Senna'],
    'Mercedes-Benz': ['A-Class', 'AMG GT', 'C-Class', 'CLA', 'CLS', 'E-Class', 'G-Class', 'GLA', 'GLC', 'GLE', 'GLS', 'S-Class', 'SL', 'Sprinter'],
    'Mini': ['Clubman', 'Convertible', 'Cooper', 'Cooper S', 'Countryman', 'Coupe', 'Paceman', 'Roadster'],
    'Mitsubishi': ['3000GT', 'Diamante', 'Eclipse', 'Eclipse Cross', 'Endeavor', 'Galant', 'Lancer', 'Mirage', 'Montero', 'Outlander'],
    'Nissan': ['370Z', 'Altima', 'Armada', 'Frontier', 'GT-R', 'Juke', 'Leaf', 'Maxima', 'Murano', 'Pathfinder', 'Rogue', 'Sentra', 'Titan', 'Versa'],
    'Oldsmobile': ['88', '98', 'Achieva', 'Alero', 'Aurora', 'Bravada', 'Cutlass', 'Intrigue', 'Silhouette'],
    'Plymouth': ['Acclaim', 'Breeze', 'Grand Voyager', 'Laser', 'Neon', 'Prowler', 'Sundance', 'Voyager'],
    'Pontiac': ['Aztek', 'Bonneville', 'Firebird', 'G6', 'G8', 'Grand Am', 'Grand Prix', 'Sunfire', 'Trans Am'],
    'Porsche': ['718', '911', '918 Spyder', 'Boxster', 'Cayenne', 'Cayman', 'Macan', 'Panamera', 'Taycan'],
    'Ram': ['1500', '2500', '3500', 'Dakota', 'ProMaster', 'ProMaster City', 'Ram Van', 'Ram Wagon'],
    'Rolls-Royce': ['Cullinan', 'Dawn', 'Ghost', 'Phantom', 'Silver Shadow', 'Silver Spirit', 'Wraith'],
    'Saab': ['9-3', '9-5', '9-7X', '900', '9000', '95', '96', '99'],
    'Saturn': ['Aura', 'Ion', 'L-Series', 'Outlook', 'Relay', 'S-Series', 'Sky', 'Vue'],
    'Scion': ['FR-S', 'iQ', 'tC', 'xA', 'xB', 'xD'],
    'Smart': ['Crossblade', 'Forfour', 'Fortwo', 'Roadster'],
    'Subaru': ['Ascent', 'Baja', 'BRZ', 'Crosstrek', 'Forester', 'Impreza', 'Legacy', 'Outback', 'SVX', 'Tribeca', 'WRX'],
    'Suzuki': ['Aerio', 'Equator', 'Forenza', 'Grand Vitara', 'Kizashi', 'Reno', 'Swift', 'SX4', 'Verona', 'XL7'],
    'Tesla': ['Cybertruck', 'Model 3', 'Model S', 'Model X', 'Model Y', 'Roadster', 'Semi'],
    'Toyota': ['4Runner', 'Avalon', 'C-HR', 'Camry', 'Corolla', 'Highlander', 'Land Cruiser', 'Prius', 'RAV4', 'Sequoia', 'Sienna', 'Tacoma', 'Tundra', 'Venza', 'Yaris'],
    'Volkswagen': ['Arteon', 'Atlas', 'Beetle', 'CC', 'GLI', 'Golf', 'GTI', 'ID.4', 'Jetta', 'Passat', 'R32', 'Tiguan', 'Touareg'],
    'Volvo': ['C30', 'C70', 'S40', 'S60', 'S80', 'S90', 'V50', 'V60', 'V70', 'V90', 'XC40', 'XC60', 'XC90'],
    'Other': ['Custom', 'Kit Car', 'Modified', 'Replica', 'Restored']
  };

  const engineTypes = [
    '4-Cylinder', '6-Cylinder', '8-Cylinder', 'V6', 'V8', 'Hybrid', 'Electric'
  ];

  const transmissions = [
    'Automatic', 'Manual', 'CVT', 'Semi-Automatic'
  ];

  const fuelTypes = [
    'Gasoline', 'Diesel', 'Hybrid', 'Electric', 'E85', 'LPG'
  ];

  // Dynamic body styles based on make/model
  const getBodyStyles = (make: any, model: any) => {
    // Test with Honda CR-V to verify the system works
    if (make === 'Honda' && model === 'CR-V') {
      return ['SUV'];
    }
    
    const bodyStylePatterns = {
      'Toyota': {
        'Camry': ['Sedan'],
        'Corolla': ['Sedan', 'Hatchback'],
        'RAV4': ['SUV'],
        'Highlander': ['SUV'],
        'Prius': ['Hatchback', 'Sedan'],
        'Tacoma': ['Pickup Truck'],
        'Tundra': ['Pickup Truck'],
        'Sienna': ['Minivan'],
        '4Runner': ['SUV'],
        'Avalon': ['Sedan'],
        'Yaris': ['Hatchback', 'Sedan'],
        'C-HR': ['Crossover'],
        'Venza': ['Crossover'],
        'Sequoia': ['SUV'],
        'Land Cruiser': ['SUV']
      },
      'Honda': {
        'Civic': ['Sedan', 'Hatchback', 'Coupe'],
        'Accord': ['Sedan', 'Coupe'],
        'CR-V': ['SUV'],
        'Pilot': ['SUV'],
        'HR-V': ['Crossover'],
        'Passport': ['SUV'],
        'Ridgeline': ['Pickup Truck'],
        'Odyssey': ['Minivan'],
        'Insight': ['Sedan'],
        'Fit': ['Hatchback'],
        'Element': ['Crossover'],
        'S2000': ['Convertible'],
        'NSX': ['Coupe']
      },
      'Ford': {
        'F-150': ['Pickup Truck'],
        'Escape': ['Crossover'],
        'Explorer': ['SUV'],
        'Expedition': ['SUV'],
        'Mustang': ['Coupe', 'Convertible'],
        'Focus': ['Sedan', 'Hatchback'],
        'Fusion': ['Sedan'],
        'Edge': ['Crossover'],
        'Bronco': ['SUV'],
        'Ranger': ['Pickup Truck'],
        'Transit': ['Van'],
        'EcoSport': ['Crossover'],
        'Flex': ['Crossover'],
        'Taurus': ['Sedan']
      },
      'BMW': {
        '3 Series': ['Sedan', 'Wagon', 'Convertible', 'Coupe'],
        '5 Series': ['Sedan', 'Wagon'],
        '7 Series': ['Sedan'],
        'X1': ['Crossover'],
        'X3': ['SUV'],
        'X5': ['SUV'],
        'X7': ['SUV'],
        'Z4': ['Convertible'],
        'i3': ['Hatchback'],
        'i8': ['Coupe', 'Convertible'],
        'M2': ['Coupe'],
        'M3': ['Sedan'],
        'M4': ['Coupe', 'Convertible'],
        'M5': ['Sedan'],
        'M8': ['Coupe', 'Convertible']
      },
      'Tesla': {
        'Model S': ['Sedan'],
        'Model 3': ['Sedan'],
        'Model X': ['SUV'],
        'Model Y': ['Crossover'],
        'Roadster': ['Convertible'],
        'Cybertruck': ['Pickup Truck'],
        'Semi': ['Truck']
      },
      'Chevrolet': {
        'Silverado': ['Pickup Truck'],
        'Equinox': ['Crossover'],
        'Traverse': ['SUV'],
        'Tahoe': ['SUV'],
        'Suburban': ['SUV'],
        'Malibu': ['Sedan'],
        'Cruze': ['Sedan', 'Hatchback'],
        'Camaro': ['Coupe', 'Convertible'],
        'Corvette': ['Coupe', 'Convertible'],
        'Colorado': ['Pickup Truck'],
        'Blazer': ['SUV'],
        'Trax': ['Crossover'],
        'Sonic': ['Sedan', 'Hatchback'],
        'Impala': ['Sedan']
      },
      'Nissan': {
        'Altima': ['Sedan'],
        'Sentra': ['Sedan'],
        'Maxima': ['Sedan'],
        'Rogue': ['Crossover'],
        'Murano': ['Crossover'],
        'Pathfinder': ['SUV'],
        'Armada': ['SUV'],
        'Frontier': ['Pickup Truck'],
        'Titan': ['Pickup Truck'],
        '370Z': ['Coupe', 'Convertible'],
        'GT-R': ['Coupe'],
        'Leaf': ['Hatchback'],
        'Versa': ['Sedan', 'Hatchback'],
        'Juke': ['Crossover']
      },
      'Hyundai': {
        'Elantra': ['Sedan'],
        'Sonata': ['Sedan'],
        'Tucson': ['Crossover'],
        'Santa Fe': ['SUV'],
        'Palisade': ['SUV'],
        'Kona': ['Crossover'],
        'Veloster': ['Hatchback'],
        'Genesis': ['Sedan'],
        'Accent': ['Sedan', 'Hatchback'],
        'Ioniq': ['Hatchback'],
        'Nexo': ['Crossover'],
        'Venue': ['Crossover']
      },
      'Kia': {
        'Forte': ['Sedan', 'Hatchback'],
        'Optima': ['Sedan'],
        'Sorento': ['SUV'],
        'Telluride': ['SUV'],
        'Sportage': ['Crossover'],
        'Soul': ['Hatchback'],
        'Stinger': ['Sedan'],
        'Niro': ['Crossover'],
        'Sedona': ['Minivan'],
        'Rio': ['Sedan', 'Hatchback'],
        'Cadenza': ['Sedan'],
        'K900': ['Sedan']
      }
    };

    if ((bodyStylePatterns as any)[make] && (bodyStylePatterns as any)[make][model]) {
      return (bodyStylePatterns as any)[make][model];
    }

    return ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Convertible', 'Wagon', 'Pickup Truck', 'Crossover', 'Minivan', 'Van', 'Sports Car', 'Other'];
  };

  // Dynamic drivetrains based on make/model/year
  const getDrivetrains = (make: any, model: any, year: any) => {
    // Test with Honda CR-V to verify the system works
    if (make === 'Honda' && model === 'CR-V') {
      return ['Front-Wheel Drive (FWD)', 'All-Wheel Drive (AWD)'];
    }
    
    const drivetrainPatterns = {
      'Toyota': {
        'Camry': ['Front-Wheel Drive (FWD)', 'All-Wheel Drive (AWD)'],
        'Corolla': ['Front-Wheel Drive (FWD)', 'All-Wheel Drive (AWD)'],
        'RAV4': ['Front-Wheel Drive (FWD)', 'All-Wheel Drive (AWD)'],
        'Highlander': ['Front-Wheel Drive (FWD)', 'All-Wheel Drive (AWD)'],
        'Prius': ['Front-Wheel Drive (FWD)', 'All-Wheel Drive (AWD)'],
        'Tacoma': ['Rear-Wheel Drive (RWD)', 'Four-Wheel Drive (4WD)'],
        'Tundra': ['Rear-Wheel Drive (RWD)', 'Four-Wheel Drive (4WD)'],
        'Sienna': ['Front-Wheel Drive (FWD)', 'All-Wheel Drive (AWD)'],
        '4Runner': ['Rear-Wheel Drive (RWD)', 'Four-Wheel Drive (4WD)'],
        'Avalon': ['Front-Wheel Drive (FWD)'],
        'Yaris': ['Front-Wheel Drive (FWD)'],
        'C-HR': ['Front-Wheel Drive (FWD)'],
        'Venza': ['Front-Wheel Drive (FWD)', 'All-Wheel Drive (AWD)'],
        'Sequoia': ['Rear-Wheel Drive (RWD)', 'Four-Wheel Drive (4WD)'],
        'Land Cruiser': ['Four-Wheel Drive (4WD)']
      },
      'Honda': {
        'Civic': ['Front-Wheel Drive (FWD)'],
        'Accord': ['Front-Wheel Drive (FWD)'],
        'CR-V': ['Front-Wheel Drive (FWD)', 'All-Wheel Drive (AWD)'],
        'Pilot': ['Front-Wheel Drive (FWD)', 'All-Wheel Drive (AWD)'],
        'HR-V': ['Front-Wheel Drive (FWD)', 'All-Wheel Drive (AWD)'],
        'Passport': ['Front-Wheel Drive (FWD)', 'All-Wheel Drive (AWD)'],
        'Ridgeline': ['Front-Wheel Drive (FWD)', 'All-Wheel Drive (AWD)'],
        'Odyssey': ['Front-Wheel Drive (FWD)'],
        'Insight': ['Front-Wheel Drive (FWD)'],
        'Fit': ['Front-Wheel Drive (FWD)'],
        'Element': ['Front-Wheel Drive (FWD)', 'All-Wheel Drive (AWD)'],
        'S2000': ['Rear-Wheel Drive (RWD)'],
        'NSX': ['All-Wheel Drive (AWD)']
      },
      'Ford': {
        'F-150': ['Rear-Wheel Drive (RWD)', 'Four-Wheel Drive (4WD)'],
        'Escape': ['Front-Wheel Drive (FWD)', 'All-Wheel Drive (AWD)'],
        'Explorer': ['Rear-Wheel Drive (RWD)', 'All-Wheel Drive (AWD)'],
        'Expedition': ['Rear-Wheel Drive (RWD)', 'Four-Wheel Drive (4WD)'],
        'Mustang': ['Rear-Wheel Drive (RWD)'],
        'Focus': ['Front-Wheel Drive (FWD)'],
        'Fusion': ['Front-Wheel Drive (FWD)', 'All-Wheel Drive (AWD)'],
        'Edge': ['Front-Wheel Drive (FWD)', 'All-Wheel Drive (AWD)'],
        'Bronco': ['Four-Wheel Drive (4WD)'],
        'Ranger': ['Rear-Wheel Drive (RWD)', 'Four-Wheel Drive (4WD)'],
        'Transit': ['Rear-Wheel Drive (RWD)'],
        'EcoSport': ['Front-Wheel Drive (FWD)', 'All-Wheel Drive (AWD)'],
        'Flex': ['Front-Wheel Drive (FWD)', 'All-Wheel Drive (AWD)'],
        'Taurus': ['Front-Wheel Drive (FWD)', 'All-Wheel Drive (AWD)']
      },
      'BMW': {
        '3 Series': ['Rear-Wheel Drive (RWD)', 'All-Wheel Drive (AWD)'],
        '5 Series': ['Rear-Wheel Drive (RWD)', 'All-Wheel Drive (AWD)'],
        '7 Series': ['Rear-Wheel Drive (RWD)', 'All-Wheel Drive (AWD)'],
        'X1': ['Front-Wheel Drive (FWD)', 'All-Wheel Drive (AWD)'],
        'X3': ['All-Wheel Drive (AWD)'],
        'X5': ['All-Wheel Drive (AWD)'],
        'X7': ['All-Wheel Drive (AWD)'],
        'Z4': ['Rear-Wheel Drive (RWD)'],
        'i3': ['Rear-Wheel Drive (RWD)'],
        'i8': ['All-Wheel Drive (AWD)'],
        'M2': ['Rear-Wheel Drive (RWD)'],
        'M3': ['Rear-Wheel Drive (RWD)', 'All-Wheel Drive (AWD)'],
        'M4': ['Rear-Wheel Drive (RWD)'],
        'M5': ['All-Wheel Drive (AWD)'],
        'M8': ['All-Wheel Drive (AWD)']
      },
      'Tesla': {
        'Model S': ['Rear-Wheel Drive (RWD)', 'All-Wheel Drive (AWD)'],
        'Model 3': ['Rear-Wheel Drive (RWD)', 'All-Wheel Drive (AWD)'],
        'Model X': ['All-Wheel Drive (AWD)'],
        'Model Y': ['All-Wheel Drive (AWD)'],
        'Roadster': ['Rear-Wheel Drive (RWD)'],
        'Cybertruck': ['Rear-Wheel Drive (RWD)', 'All-Wheel Drive (AWD)'],
        'Semi': ['All-Wheel Drive (AWD)']
      },
      'Chevrolet': {
        'Silverado': ['Rear-Wheel Drive (RWD)', 'Four-Wheel Drive (4WD)'],
        'Equinox': ['Front-Wheel Drive (FWD)', 'All-Wheel Drive (AWD)'],
        'Traverse': ['Front-Wheel Drive (FWD)', 'All-Wheel Drive (AWD)'],
        'Tahoe': ['Rear-Wheel Drive (RWD)', 'Four-Wheel Drive (4WD)'],
        'Suburban': ['Rear-Wheel Drive (RWD)', 'Four-Wheel Drive (4WD)'],
        'Malibu': ['Front-Wheel Drive (FWD)'],
        'Cruze': ['Front-Wheel Drive (FWD)'],
        'Camaro': ['Rear-Wheel Drive (RWD)'],
        'Corvette': ['Rear-Wheel Drive (RWD)'],
        'Colorado': ['Rear-Wheel Drive (RWD)', 'Four-Wheel Drive (4WD)'],
        'Blazer': ['Front-Wheel Drive (FWD)', 'All-Wheel Drive (AWD)'],
        'Trax': ['Front-Wheel Drive (FWD)', 'All-Wheel Drive (AWD)'],
        'Sonic': ['Front-Wheel Drive (FWD)'],
        'Impala': ['Front-Wheel Drive (FWD)']
      },
      'Nissan': {
        'Altima': ['Front-Wheel Drive (FWD)', 'All-Wheel Drive (AWD)'],
        'Sentra': ['Front-Wheel Drive (FWD)'],
        'Maxima': ['Front-Wheel Drive (FWD)'],
        'Rogue': ['Front-Wheel Drive (FWD)', 'All-Wheel Drive (AWD)'],
        'Murano': ['Front-Wheel Drive (FWD)', 'All-Wheel Drive (AWD)'],
        'Pathfinder': ['Front-Wheel Drive (FWD)', 'All-Wheel Drive (AWD)'],
        'Armada': ['Rear-Wheel Drive (RWD)', 'Four-Wheel Drive (4WD)'],
        'Frontier': ['Rear-Wheel Drive (RWD)', 'Four-Wheel Drive (4WD)'],
        'Titan': ['Rear-Wheel Drive (RWD)', 'Four-Wheel Drive (4WD)'],
        '370Z': ['Rear-Wheel Drive (RWD)'],
        'GT-R': ['All-Wheel Drive (AWD)'],
        'Leaf': ['Front-Wheel Drive (FWD)'],
        'Versa': ['Front-Wheel Drive (FWD)'],
        'Juke': ['Front-Wheel Drive (FWD)', 'All-Wheel Drive (AWD)']
      },
      'Hyundai': {
        'Elantra': ['Front-Wheel Drive (FWD)'],
        'Sonata': ['Front-Wheel Drive (FWD)'],
        'Tucson': ['Front-Wheel Drive (FWD)', 'All-Wheel Drive (AWD)'],
        'Santa Fe': ['Front-Wheel Drive (FWD)', 'All-Wheel Drive (AWD)'],
        'Palisade': ['Front-Wheel Drive (FWD)', 'All-Wheel Drive (AWD)'],
        'Kona': ['Front-Wheel Drive (FWD)', 'All-Wheel Drive (AWD)'],
        'Veloster': ['Front-Wheel Drive (FWD)'],
        'Genesis': ['Rear-Wheel Drive (RWD)', 'All-Wheel Drive (AWD)'],
        'Accent': ['Front-Wheel Drive (FWD)'],
        'Ioniq': ['Front-Wheel Drive (FWD)'],
        'Nexo': ['Front-Wheel Drive (FWD)'],
        'Venue': ['Front-Wheel Drive (FWD)']
      },
      'Kia': {
        'Forte': ['Front-Wheel Drive (FWD)'],
        'Optima': ['Front-Wheel Drive (FWD)'],
        'Sorento': ['Front-Wheel Drive (FWD)', 'All-Wheel Drive (AWD)'],
        'Telluride': ['Front-Wheel Drive (FWD)', 'All-Wheel Drive (AWD)'],
        'Sportage': ['Front-Wheel Drive (FWD)', 'All-Wheel Drive (AWD)'],
        'Soul': ['Front-Wheel Drive (FWD)'],
        'Stinger': ['Rear-Wheel Drive (RWD)', 'All-Wheel Drive (AWD)'],
        'Niro': ['Front-Wheel Drive (FWD)'],
        'Sedona': ['Front-Wheel Drive (FWD)'],
        'Rio': ['Front-Wheel Drive (FWD)'],
        'Cadenza': ['Front-Wheel Drive (FWD)'],
        'K900': ['Rear-Wheel Drive (RWD)', 'All-Wheel Drive (AWD)']
      }
    };

    if ((drivetrainPatterns as any)[make] && (drivetrainPatterns as any)[make][model]) {
      return (drivetrainPatterns as any)[make][model];
    }

    return ['Front-Wheel Drive (FWD)', 'Rear-Wheel Drive (RWD)', 'All-Wheel Drive (AWD)', 'Four-Wheel Drive (4WD)', 'Other'];
  };

  // Dynamic trim levels based on make/model/year
  const getTrimLevels = (make: any, model: any, year: any) => {
    // Year-specific trims database (incrementally extendable)
    const trimsByYear = {
      'Acura': {
        'Integra': {
          // Classic era (1994-2001)
          1994: ['LS', 'GS', 'GS-R'],
          1995: ['LS', 'GS', 'GS-R'],
          1996: ['LS', 'GS', 'GS-R'],
          1997: ['LS', 'GS', 'GS-R', 'Type R'],
          1998: ['LS', 'GS', 'GS-R', 'Type R'],
          1999: ['LS', 'GS', 'GS-R', 'Type R'],
          2000: ['LS', 'GS', 'GS-R', 'Type R'],
          2001: ['LS', 'GS', 'GS-R', 'Type R'],
          // Modern era (2022+)
          2022: ['Base', 'A-Spec', 'A-Spec Tech', 'Type S'],
          2023: ['Base', 'A-Spec', 'A-Spec Tech', 'Type S'],
          2024: ['Base', 'A-Spec', 'A-Spec Tech', 'Type S'],
          2025: ['Base', 'A-Spec', 'A-Spec Tech', 'Type S'],
        },
        'TL': {
          2004: ['Base', 'Type-S'],
          2005: ['Base', 'Type-S'],
          2006: ['Base', 'Type-S'],
          2007: ['Base', 'Type-S'],
          2008: ['Base', 'Type-S'],
          2009: ['Base', 'Type-S'],
          2010: ['Base', 'Type-S'],
          2011: ['Base', 'Type-S'],
          2012: ['Base', 'Type-S'],
          2013: ['Base', 'Type-S'],
          2014: ['Base', 'Type-S'],
          2015: ['Base', 'Type-S'],
          2016: ['Base', 'Type-S'],
          2017: ['Base', 'Type-S'],
          2018: ['Base', 'Type-S'],
          2019: ['Base', 'Type-S'],
          2020: ['Base', 'Type-S'],
          2021: ['Base', 'Type-S'],
          2022: ['Base', 'Type-S'],
          2023: ['Base', 'Type-S'],
          2024: ['Base', 'Type-S'],
          2025: ['Base', 'Type-S'],
        },
        'TSX': {
          2004: ['Base', 'Type-S'],
          2005: ['Base', 'Type-S'],
          2006: ['Base', 'Type-S'],
          2007: ['Base', 'Type-S'],
          2008: ['Base', 'Type-S'],
          2009: ['Base', 'Type-S'],
          2010: ['Base', 'Type-S'],
          2011: ['Base', 'Type-S'],
          2012: ['Base', 'Type-S'],
          2013: ['Base', 'Type-S'],
          2014: ['Base', 'Type-S'],
        },
        'ILX': {
          2013: ['Base', 'Premium', 'Technology'],
          2014: ['Base', 'Premium', 'Technology'],
          2015: ['Base', 'Premium', 'Technology'],
          2016: ['Base', 'Premium', 'Technology'],
          2017: ['Base', 'Premium', 'Technology'],
          2018: ['Base', 'Premium', 'Technology'],
          2019: ['Base', 'Premium', 'Technology'],
          2020: ['Base', 'Premium', 'Technology'],
          2021: ['Base', 'Premium', 'Technology'],
          2022: ['Base', 'Premium', 'Technology'],
          2023: ['Base', 'Premium', 'Technology'],
          2024: ['Base', 'Premium', 'Technology'],
          2025: ['Base', 'Premium', 'Technology'],
        },
        'RL': {
          2005: ['Base', 'Technology'],
          2006: ['Base', 'Technology'],
          2007: ['Base', 'Technology'],
          2008: ['Base', 'Technology'],
          2009: ['Base', 'Technology'],
          2010: ['Base', 'Technology'],
          2011: ['Base', 'Technology'],
          2012: ['Base', 'Technology'],
          2013: ['Base', 'Technology'],
          2014: ['Base', 'Technology'],
          2015: ['Base', 'Technology'],
          2016: ['Base', 'Technology'],
          2017: ['Base', 'Technology'],
          2018: ['Base', 'Technology'],
          2019: ['Base', 'Technology'],
          2020: ['Base', 'Technology'],
          2021: ['Base', 'Technology'],
          2022: ['Base', 'Technology'],
          2023: ['Base', 'Technology'],
          2024: ['Base', 'Technology'],
          2025: ['Base', 'Technology'],
        },
        'RLX': {
          2014: ['Base', 'Technology', 'Advance'],
          2015: ['Base', 'Technology', 'Advance'],
          2016: ['Base', 'Technology', 'Advance'],
          2017: ['Base', 'Technology', 'Advance'],
          2018: ['Base', 'Technology', 'Advance'],
          2019: ['Base', 'Technology', 'Advance'],
          2020: ['Base', 'Technology', 'Advance'],
          2021: ['Base', 'Technology', 'Advance'],
          2022: ['Base', 'Technology', 'Advance'],
          2023: ['Base', 'Technology', 'Advance'],
          2024: ['Base', 'Technology', 'Advance'],
          2025: ['Base', 'Technology', 'Advance'],
        },
        'MDX': {
          2001: ['Base', 'Touring'],
          2002: ['Base', 'Touring'],
          2003: ['Base', 'Touring'],
          2004: ['Base', 'Touring'],
          2005: ['Base', 'Touring'],
          2006: ['Base', 'Touring'],
          2007: ['Base', 'Touring'],
          2008: ['Base', 'Touring'],
          2009: ['Base', 'Touring'],
          2010: ['Base', 'Touring'],
          2011: ['Base', 'Touring'],
          2012: ['Base', 'Touring'],
          2013: ['Base', 'Touring'],
          2014: ['Base', 'Touring'],
          2015: ['Base', 'Touring'],
          2016: ['Base', 'Touring'],
          2017: ['Base', 'Touring'],
          2018: ['Base', 'Touring'],
          2019: ['Base', 'Touring'],
          2020: ['Base', 'Touring'],
          2021: ['Base', 'Touring'],
          2022: ['Base', 'Touring'],
          2023: ['Base', 'Touring'],
          2024: ['Base', 'Touring'],
          2025: ['Base', 'Touring'],
        },
        'RDX': {
          2007: ['Base', 'Technology'],
          2008: ['Base', 'Technology'],
          2009: ['Base', 'Technology'],
          2010: ['Base', 'Technology'],
          2011: ['Base', 'Technology'],
          2012: ['Base', 'Technology'],
          2013: ['Base', 'Technology'],
          2014: ['Base', 'Technology'],
          2015: ['Base', 'Technology'],
          2016: ['Base', 'Technology'],
          2017: ['Base', 'Technology'],
          2018: ['Base', 'Technology'],
          2019: ['Base', 'Technology'],
          2020: ['Base', 'Technology'],
          2021: ['Base', 'Technology'],
          2022: ['Base', 'Technology'],
          2023: ['Base', 'Technology'],
          2024: ['Base', 'Technology'],
          2025: ['Base', 'Technology'],
        },
        'NSX': {
          1991: ['Base'],
          1992: ['Base'],
          1993: ['Base'],
          1994: ['Base'],
          1995: ['Base'],
          1996: ['Base'],
          1997: ['Base'],
          1998: ['Base'],
          1999: ['Base'],
          2000: ['Base'],
          2001: ['Base'],
          2002: ['Base'],
          2003: ['Base'],
          2004: ['Base'],
          2005: ['Base'],
          2017: ['Base', 'Technology'],
          2018: ['Base', 'Technology'],
          2019: ['Base', 'Technology'],
          2020: ['Base', 'Technology'],
          2021: ['Base', 'Technology'],
          2022: ['Base', 'Technology'],
          2023: ['Base', 'Technology'],
          2024: ['Base', 'Technology'],
          2025: ['Base', 'Technology'],
        },
        'RSX': {
          2002: ['Base', 'Type-S'],
          2003: ['Base', 'Type-S'],
          2004: ['Base', 'Type-S'],
          2005: ['Base', 'Type-S'],
          2006: ['Base', 'Type-S'],
        },
        'CL': {
          1997: ['Base', 'Type-S'],
          1998: ['Base', 'Type-S'],
          1999: ['Base', 'Type-S'],
          2000: ['Base', 'Type-S'],
          2001: ['Base', 'Type-S'],
          2002: ['Base', 'Type-S'],
          2003: ['Base', 'Type-S'],
        },
        'TLX': {
          2015: ['Base', 'Technology', 'Advance'],
          2016: ['Base', 'Technology', 'Advance'],
          2017: ['Base', 'Technology', 'Advance'],
          2018: ['Base', 'Technology', 'Advance'],
          2019: ['Base', 'Technology', 'Advance'],
          2020: ['Base', 'Technology', 'Advance'],
          2021: ['Base', 'Technology', 'Advance'],
          2022: ['Base', 'Technology', 'Advance'],
          2023: ['Base', 'Technology', 'Advance'],
          2024: ['Base', 'Technology', 'Advance'],
          2025: ['Base', 'Technology', 'Advance'],
        },
        'ZDX': {
          2010: ['Base', 'Technology', 'Advance'],
          2011: ['Base', 'Technology', 'Advance'],
          2012: ['Base', 'Technology', 'Advance'],
          2013: ['Base', 'Technology', 'Advance'],
        },
      },
    } as any;

    const normalizedYear = typeof year === 'string' ? parseInt(year, 10) : year;

    // If we have exact year-specific trims, return those
    if (
      normalizedYear &&
      trimsByYear[make] &&
      (trimsByYear as any)[make][model] &&
      (trimsByYear as any)[make][model][normalizedYear]
    ) {
      return (trimsByYear as any)[make][model][normalizedYear].slice().sort((a: string, b: string) => a.localeCompare(b));
    }
    
    // Test with Honda CR-V to verify the system works
    if (make === 'Honda' && model === 'CR-V') {
      return ['EX', 'EX-L', 'Hybrid', 'LX', 'Touring'].slice().sort((a: any, b: any) => a.localeCompare(b));
    }
    
    // Common trim patterns by manufacturer
    const trimPatterns = {
      'Toyota': {
        'Camry': ['LE', 'SE', 'XLE', 'XSE', 'TRD', 'Hybrid LE', 'Hybrid SE', 'Hybrid XLE', 'Hybrid XSE'],
        'Corolla': ['L', 'LE', 'SE', 'XLE', 'XSE', 'Hybrid LE', 'Hybrid XLE'],
        'RAV4': ['LE', 'XLE', 'XLE Premium', 'Adventure', 'TRD Off-Road', 'Limited', 'Hybrid LE', 'Hybrid XLE', 'Hybrid XSE', 'Hybrid Limited'],
        'Highlander': ['L', 'LE', 'XLE', 'Limited', 'Platinum', 'Hybrid LE', 'Hybrid XLE', 'Hybrid Limited', 'Hybrid Platinum'],
        'Prius': ['L Eco', 'LE', 'XLE', 'Limited', 'Prime LE', 'Prime XLE', 'Prime Limited'],
        'Tacoma': ['SR', 'SR5', 'TRD Sport', 'TRD Off-Road', 'TRD Pro', 'Limited'],
        'Tundra': ['SR', 'SR5', 'Limited', 'Platinum', '1794 Edition', 'TRD Pro'],
        'Sienna': ['L', 'LE', 'XLE', 'Limited', 'Platinum'],
        '4Runner': ['SR5', 'TRD Off-Road', 'TRD Off-Road Premium', 'Limited', 'TRD Pro'],
        'Avalon': ['XLE', 'XSE', 'Limited', 'Touring', 'Hybrid XLE', 'Hybrid XSE', 'Hybrid Limited'],
        'Yaris': ['L', 'LE', 'XLE'],
        'C-HR': ['LE', 'XLE'],
        'Venza': ['LE', 'XLE', 'Limited'],
        'Sequoia': ['SR5', 'Limited', 'Platinum', 'TRD Pro'],
        'Land Cruiser': ['Base', 'Heritage Edition']
      },
      'Honda': {
        'Civic': ['LX', 'Sport', 'EX', 'EX-L', 'Sport Touring', 'Type R'],
        'Accord': ['LX', 'Sport', 'EX', 'EX-L', 'Touring', 'Sport 2.0T', 'Hybrid'],
        'CR-V': ['LX', 'EX', 'EX-L', 'Touring', 'Hybrid'],
        'Pilot': ['LX', 'EX', 'EX-L', 'Touring', 'Elite'],
        'HR-V': ['LX', 'Sport', 'EX', 'EX-L'],
        'Passport': ['Sport', 'EX-L', 'Touring', 'Elite'],
        'Ridgeline': ['Sport', 'RTL', 'RTL-E', 'RTL-T', 'Black Edition'],
        'Odyssey': ['LX', 'EX', 'EX-L', 'Touring', 'Elite'],
        'Insight': ['LX', 'EX', 'Touring'],
        'Fit': ['LX', 'Sport', 'EX', 'EX-L'],
        'Element': ['LX', 'EX'],
        'S2000': ['Base'],
        'NSX': ['Base', 'Type S']
      },
      'Ford': {
        'F-150': ['XL', 'XLT', 'Lariat', 'King Ranch', 'Platinum', 'Limited', 'Raptor', 'Tremor'],
        'Escape': ['S', 'SE', 'SEL', 'Titanium', 'ST-Line', 'Hybrid SE', 'Hybrid SEL', 'Hybrid Titanium'],
        'Explorer': ['Base', 'XLT', 'Limited', 'ST', 'Platinum', 'King Ranch', 'Timberline'],
        'Expedition': ['XL', 'XLT', 'Limited', 'King Ranch', 'Platinum', 'Max'],
        'Mustang': ['EcoBoost', 'GT', 'Mach 1', 'Shelby GT500', 'Shelby GT350'],
        'Focus': ['S', 'SE', 'SEL', 'Titanium', 'ST', 'RS'],
        'Fusion': ['S', 'SE', 'SEL', 'Titanium', 'Sport', 'Energi'],
        'Edge': ['SE', 'SEL', 'ST-Line', 'Titanium', 'ST'],
        'Bronco': ['Base', 'Big Bend', 'Black Diamond', 'Outer Banks', 'Badlands', 'Wildtrak', 'First Edition'],
        'Ranger': ['XL', 'XLT', 'Lariat', 'Tremor', 'FX4'],
        'Transit': ['T-150', 'T-250', 'T-350', 'T-450'],
        'EcoSport': ['S', 'SE', 'SES', 'Titanium'],
        'Flex': ['SE', 'SEL', 'Limited', 'Titanium'],
        'Taurus': ['S', 'SE', 'SEL', 'Limited', 'SHO']
      },
      'BMW': {
        '3 Series': ['320i', '330i', 'M340i', 'M3'],
        '5 Series': ['530i', '540i', 'M550i', 'M5'],
        '7 Series': ['740i', '750i', 'M760i', 'Alpina B7'],
        'X1': ['sDrive28i', 'xDrive28i'],
        'X3': ['sDrive30i', 'xDrive30i', 'M40i', 'X3 M'],
        'X5': ['sDrive40i', 'xDrive40i', 'M50i', 'X5 M'],
        'X7': ['xDrive40i', 'M50i', 'Alpina XB7'],
        'Z4': ['sDrive30i', 'M40i'],
        'i3': ['Base', 's'],
        'i8': ['Base', 'Roadster'],
        'M2': ['Base', 'Competition', 'CS'],
        'M3': ['Base', 'Competition', 'CS'],
        'M4': ['Base', 'Competition', 'CS'],
        'M5': ['Base', 'Competition', 'CS'],
        'M8': ['Base', 'Competition', 'CS']
      },
      'Tesla': {
        'Model S': ['Long Range', 'Plaid'],
        'Model 3': ['Standard Range Plus', 'Long Range', 'Performance'],
        'Model X': ['Long Range', 'Plaid'],
        'Model Y': ['Long Range', 'Performance'],
        'Roadster': ['Base'],
        'Cybertruck': ['Single Motor', 'Dual Motor', 'Tri Motor'],
        'Semi': ['Base']
      },
      'Chevrolet': {
        'Silverado': ['Work Truck', 'Custom', 'LT', 'RST', 'LTZ', 'High Country'],
        'Equinox': ['L', 'LS', 'LT', 'Premier', 'RS'],
        'Traverse': ['L', 'LS', 'LT', 'RS', 'Premier', 'High Country'],
        'Tahoe': ['LS', 'LT', 'RST', 'Premier', 'High Country', 'Z71'],
        'Suburban': ['LS', 'LT', 'RST', 'Premier', 'High Country', 'Z71'],
        'Malibu': ['L', 'LS', 'LT', 'Premier', 'RS'],
        'Cruze': ['L', 'LS', 'LT', 'Premier'],
        'Camaro': ['LS', 'LT', 'SS', 'ZL1'],
        'Corvette': ['Stingray', 'Grand Sport', 'Z06', 'ZR1'],
        'Colorado': ['Base', 'Work Truck', 'LT', 'Z71', 'ZR2'],
        'Blazer': ['L', 'LT', 'RS', 'Premier'],
        'Trax': ['LS', 'LT', 'Premier'],
        'Sonic': ['LS', 'LT', 'RS'],
        'Impala': ['LS', 'LT', 'Premier']
      },
      'Nissan': {
        'Altima': ['S', 'SV', 'SL', 'SR', 'Platinum'],
        'Sentra': ['S', 'SV', 'SR', 'SL'],
        'Maxima': ['S', 'SV', 'SL', 'SR', 'Platinum'],
        'Rogue': ['S', 'SV', 'SL', 'Platinum'],
        'Murano': ['S', 'SV', 'SL', 'Platinum'],
        'Pathfinder': ['S', 'SV', 'SL', 'Platinum'],
        'Armada': ['SV', 'SL', 'Platinum'],
        'Frontier': ['S', 'SV', 'Pro-4X', 'SL'],
        'Titan': ['S', 'SV', 'Pro-4X', 'SL', 'Platinum Reserve'],
        '370Z': ['Sport', 'Touring', 'Nismo'],
        'GT-R': ['Premium,', 'Track Edition', 'Nismo'],
        'Leaf': ['S', 'SV', 'SL', 'SV Plus', 'SL Plus'],
        'Versa': ['S', 'SV'],
        'Juke': ['S', 'SV', 'SL', 'Nismo RS']
      },
      'Hyundai': {
        'Elantra': ['SE', 'SEL', 'Limited', 'N Line'],
        'Sonata': ['SE', 'SEL', 'Limited', 'N Line'],
        'Tucson': ['SE', 'SEL', 'Limited', 'N Line'],
        'Santa Fe': ['SE', 'SEL', 'Limited', 'Calligraphy'],
        'Palisade': ['SE', 'SEL', 'Limited', 'Calligraphy'],
        'Kona': ['SE', 'SEL', 'Limited', 'N Line'],
        'Veloster': ['2.0', 'Turbo', 'N'],
        'Genesis': ['3.8', '5.0 R-Spec'],
        'Accent': ['SE', 'Limited'],
        'Ioniq': ['Blue', 'SEL', 'Limited'],
        'Nexo': ['Blue', 'Limited'],
        'Venue': ['SE', 'SEL', 'Limited']
      },
      'Kia': {
        'Forte': ['FE', 'LXS', 'GT-Line', 'GT'],
        'Optima': ['LX', 'S', 'EX', 'SX'],
        'Sorento': ['L', 'LX', 'EX', 'SX', 'SX Prestige'],
        'Telluride': ['LX', 'S', 'EX', 'SX', 'SX Prestige'],
        'Sportage': ['LX', 'EX', 'SX'],
        'Soul': ['LX', 'S', 'GT-Line', 'Turbo'],
        'Stinger': ['GT-Line', 'GT1', 'GT2'],
        'Niro': ['FE', 'LXS', 'EX', 'EX Premium'],
        'Sedona': ['L', 'LX', 'EX', 'SX'],
        'Rio': ['S', 'LXS'],
        'Cadenza': ['Premium', 'Technology'],
        'K900': ['Luxury', 'VIP']
      },
      'Audi': {
        'A3': ['Premium', 'Premium Plus', 'Prestige', 'S3'],
        'A4': ['Premium', 'Premium Plus', 'Prestige', 'S4'],
        'A6': ['Premium', 'Premium Plus', 'Prestige', 'S6'],
        'A8': ['Premium', 'Premium Plus', 'Prestige', 'S8'],
        'Q3': ['Premium', 'Premium Plus', 'Prestige'],
        'Q5': ['Premium', 'Premium Plus', 'Prestige', 'SQ5'],
        'Q7': ['Premium', 'Premium Plus', 'Prestige', 'SQ7'],
        'Q8': ['Premium', 'Premium Plus', 'Prestige', 'SQ8'],
        'TT': ['Premium', 'Premium Plus', 'Prestige', 'TTS', 'TT RS'],
        'R8': ['R8', 'R8 Spyder', 'R8 Performance', 'R8 Performance Spyder'],
        'e-tron': ['Premium', 'Premium Plus', 'Prestige'],
        'RS3': ['Base', 'Carbon Edition'],
        'RS4': ['Base', 'Carbon Edition'],
        'RS6': ['Base', 'Carbon Edition'],
        'RS7': ['Base', 'Carbon Edition']
      },
      'Mercedes-Benz': {
        'A-Class': ['A 220', 'A 220 4MATIC', 'AMG A 35', 'AMG A 45'],
        'C-Class': ['C 300', 'C 300 4MATIC', 'C 43 AMG', 'C 63 AMG'],
        'E-Class': ['E 350', 'E 350 4MATIC', 'E 450 4MATIC', 'E 53 AMG', 'E 63 AMG'],
        'S-Class': ['S 450', 'S 450 4MATIC', 'S 560', 'S 63 AMG', 'S 65 AMG'],
        'GLA': ['GLA 250', 'GLA 250 4MATIC', 'AMG GLA 35', 'AMG GLA 45'],
        'GLC': ['GLC 300', 'GLC 300 4MATIC', 'AMG GLC 43', 'AMG GLC 63'],
        'GLE': ['GLE 350', 'GLE 350 4MATIC', 'GLE 450 4MATIC', 'AMG GLE 53', 'AMG GLE 63'],
        'GLS': ['GLS 450', 'GLS 450 4MATIC', 'GLS 580', 'AMG GLS 63'],
        'G-Class': ['G 550', 'AMG G 63'],
        'CLA': ['CLA 250', 'CLA 250 4MATIC', 'AMG CLA 35', 'AMG CLA 45'],
        'CLS': ['CLS 450', 'CLS 450 4MATIC', 'AMG CLS 53', 'AMG CLS 63'],
        'SL': ['SL 450', 'SL 550', 'AMG SL 63'],
        'AMG GT': ['AMG GT', 'AMG GT C', 'AMG GT R', 'AMG GT Black Series'],
        'Sprinter': ['2500', '3500', '4500', '5500']
      },
      'Lexus': {
        'ES': ['ES 250', 'ES 300h', 'ES 350', 'ES 350 F Sport'],
        'IS': ['IS 300', 'IS 300 AWD', 'IS 350', 'IS 350 F Sport', 'IS 500 F Sport'],
        'GS': ['GS 300', 'GS 350', 'GS 350 F Sport', 'GS 450h', 'GS F'],
        'LS': ['LS 500', 'LS 500 F Sport', 'LS 500h', 'LS 500h F Sport'],
        'RX': ['RX 350', 'RX 350 F Sport', 'RX 450h', 'RX 450h F Sport', 'RX L'],
        'GX': ['GX 460', 'GX 460 Luxury'],
        'LX': ['LX 570', 'LX 600'],
        'NX': ['NX 250', 'NX 350', 'NX 350 F Sport', 'NX 450h+'],
        'UX': ['UX 200', 'UX 250h', 'UX 250h F Sport'],
        'LC': ['LC 500', 'LC 500h'],
        'RC': ['RC 300', 'RC 350', 'RC 350 F Sport', 'RC F'],
        'CT': ['CT 200h'],
        'SC': ['SC 430'],
        'HS': ['HS 250h']
      },
      'Volkswagen': {
        'Jetta': ['S', 'SE', 'SEL', 'GLI'],
        'Passat': ['S', 'SE', 'SEL', 'R-Line'],
        'Golf': ['S', 'SE', 'SEL', 'GTI', 'R'],
        'Tiguan': ['S', 'SE', 'SEL', 'R-Line'],
        'Atlas': ['S', 'SE', 'SEL', 'R-Line'],
        'Beetle': ['S', 'SE', 'SEL', 'Final Edition'],
        'CC': ['Sport', 'R-Line'],
        'Arteon': ['SE', 'SEL', 'R-Line'],
        'ID.4': ['Standard', 'Pro', 'Pro S'],
        'Touareg': ['V6', 'V6 Executive', 'V8'],
        'GTI': ['S', 'SE', 'Autobahn'],
        'GLI': ['S', '35th Anniversary', 'Autobahn'],
        'R32': ['Base']
      },
      'Mazda': {
        'Mazda3': ['Base', 'Select', 'Preferred', 'Premium', 'Turbo'],
        'Mazda6': ['Sport', 'Touring', 'Grand Touring', 'Signature'],
        'CX-3': ['Sport', 'Touring', 'Grand Touring'],
        'CX-5': ['Sport', 'Touring', 'Grand Touring', 'Signature', 'Turbo'],
        'CX-9': ['Sport', 'Touring', 'Grand Touring', 'Signature'],
        'MX-5 Miata': ['Sport', 'Club', 'Grand Touring'],
        'CX-30': ['Base', 'Select', 'Preferred', 'Premium', 'Turbo'],
        'Mazda2': ['Sport', 'Touring'],
        'RX-7': ['Base', 'Turbo', 'Turbo II'],
        'RX-8': ['Sport', 'Touring', 'Grand Touring'],
        'Tribute': ['Base', 'ES', 'LX']
      },
      'Subaru': {
        'Impreza': ['Base', 'Premium', 'Sport', 'Limited'],
        'Legacy': ['Base', 'Premium', 'Sport', 'Limited', 'Touring XT'],
        'Outback': ['Base', 'Premium', 'Limited', 'Touring', 'Wilderness'],
        'Forester': ['Base', 'Premium', 'Sport', 'Limited', 'Wilderness'],
        'Ascent': ['Base', 'Premium', 'Limited', 'Touring'],
        'WRX': ['Base', 'Premium', 'Limited', 'STI'],
        'BRZ': ['Base', 'Limited'],
        'Crosstrek': ['Base', 'Premium', 'Sport', 'Limited'],
        'Tribeca': ['Base', 'Limited', 'Touring'],
        'Baja': ['Base', 'Sport'],
        'SVX': ['Base', 'L', 'LS', 'LSi']
      }
    };

    // Get trims for specific make/model combination
    if ((trimPatterns as any)[make] && (trimPatterns as any)[make][model]) {
      return (trimPatterns as any)[make][model].slice().sort((a: any, b: any) => a.localeCompare(b));
    }

    // Fallback to common trims
    return ['Base', 'Hybrid', 'LE', 'Limited', 'Luxury', 'Platinum', 'Premium', 'SE', 'Sport', 'Touring', 'XLE', 'Other']
      .slice()
      .sort((a, b) => a.localeCompare(b));
  };

  // Dynamic engine types based on make/model/year
  const getEngineTypes = (make: any, model: any, year: any) => {
    // Test with Honda CR-V to verify the system works
    if (make === 'Honda' && model === 'CR-V') {
      return ['2.0L 4-Cylinder', '1.5L Turbo 4-Cylinder', '2.0L Hybrid'];
    }

    // Define engine types for specific make/model combinations
    const engineTypePatterns = {
      'Toyota': {
        'Camry': ['2.5L 4-Cylinder', '3.5L V6', '2.5L Hybrid'],
        'Corolla': ['1.8L 4-Cylinder', '2.0L 4-Cylinder', '1.8L Hybrid'],
        'RAV4': ['2.5L 4-Cylinder', '2.5L Hybrid', '2.5L Plug-in Hybrid'],
        'Prius': ['1.8L Hybrid', '2.0L Hybrid'],
        'Highlander': ['2.5L 4-Cylinder', '3.5L V6', '2.5L Hybrid'],
        'Tacoma': ['2.7L 4-Cylinder', '3.5L V6'],
        'Tundra': ['3.5L V6', '5.7L V8', '3.5L V6 Hybrid']
      },
      'Honda': {
        'Civic': ['2.0L 4-Cylinder', '1.5L Turbo 4-Cylinder'],
        'Accord': ['1.5L Turbo 4-Cylinder', '2.0L Turbo 4-Cylinder', '2.0L Hybrid'],
        'CR-V': ['2.0L 4-Cylinder', '1.5L Turbo 4-Cylinder', '2.0L Hybrid'],
        'Pilot': ['3.5L V6'],
        'HR-V': ['1.8L 4-Cylinder'],
        'Passport': ['3.5L V6'],
        'Ridgeline': ['3.5L V6'],
        'Odyssey': ['3.5L V6'],
        'Insight': ['1.5L Hybrid'],
        'Fit': ['1.5L 4-Cylinder']
      },
      'Ford': {
        'F-150': ['3.3L V6', '2.7L V6 Turbo', '5.0L V8', '3.5L V6 Turbo', '3.0L V6 Hybrid'],
        'Escape': ['1.5L 3-Cylinder Turbo', '2.0L 4-Cylinder Turbo', '2.5L Hybrid'],
        'Explorer': ['2.3L 4-Cylinder Turbo', '3.0L V6 Turbo', '3.3L V6 Hybrid'],
        'Mustang': ['2.3L 4-Cylinder Turbo', '5.0L V8'],
        'Focus': ['2.0L 4-Cylinder', '1.0L 3-Cylinder Turbo'],
        'Edge': ['2.0L 4-Cylinder Turbo', '2.7L V6 Turbo'],
        'Bronco': ['2.3L 4-Cylinder Turbo', '2.7L V6 Turbo']
      },
      'BMW': {
        '3 Series': ['2.0L 4-Cylinder Turbo', '3.0L 6-Cylinder Turbo'],
        '5 Series': ['2.0L 4-Cylinder Turbo', '3.0L 6-Cylinder Turbo', '4.4L V8 Turbo'],
        'X3': ['2.0L 4-Cylinder Turbo', '3.0L 6-Cylinder Turbo'],
        'X5': ['3.0L 6-Cylinder Turbo', '4.4L V8 Turbo', '3.0L 6-Cylinder Hybrid']
      },
      'Tesla': {
        'Model S': ['Electric'],
        'Model 3': ['Electric'],
        'Model X': ['Electric'],
        'Model Y': ['Electric']
      }
    };

    // Get engine types for specific make/model combination
    if ((engineTypePatterns as any)[make] && (engineTypePatterns as any)[make][model]) {
      return (engineTypePatterns as any)[make][model];
    }

    // Fallback to common engine types
    return ['4-Cylinder', '6-Cylinder', '8-Cylinder', 'V6', 'V8', 'Hybrid', 'Electric', 'Other'];
  };

  // Dynamic transmissions based on make/model/year
  const getTransmissions = (make: any, model: any, year: any) => {
    // Test with Honda CR-V to verify the system works
    if (make === 'Honda' && model === 'CR-V') {
      return ['CVT', '9-Speed Automatic'];
    }

    // Define transmissions for specific make/model combinations
    const transmissionPatterns = {
      'Toyota': {
        'Camry': ['8-Speed Automatic', 'CVT'],
        'Corolla': ['CVT', '6-Speed Manual'],
        'RAV4': ['8-Speed Automatic', 'CVT'],
        'Prius': ['CVT'],
        'Highlander': ['8-Speed Automatic', 'CVT'],
        'Tacoma': ['6-Speed Automatic', '6-Speed Manual'],
        'Tundra': ['10-Speed Automatic']
      },
      'Honda': {
        'Civic': ['CVT', '6-Speed Manual'],
        'Accord': ['CVT', '10-Speed Automatic', '6-Speed Manual'],
        'CR-V': ['CVT', '9-Speed Automatic'],
        'Pilot': ['9-Speed Automatic'],
        'HR-V': ['CVT'],
        'Passport': ['9-Speed Automatic'],
        'Ridgeline': ['9-Speed Automatic'],
        'Odyssey': ['10-Speed Automatic'],
        'Insight': ['CVT'],
        'Fit': ['CVT', '6-Speed Manual']
      },
      'Ford': {
        'F-150': ['10-Speed Automatic'],
        'Escape': ['8-Speed Automatic', 'CVT'],
        'Explorer': ['10-Speed Automatic'],
        'Mustang': ['10-Speed Automatic', '6-Speed Manual'],
        'Focus': ['6-Speed Automatic', '6-Speed Manual'],
        'Edge': ['8-Speed Automatic'],
        'Bronco': ['7-Speed Manual', '10-Speed Automatic']
      },
      'BMW': {
        '3 Series': ['8-Speed Automatic', '6-Speed Manual'],
        '5 Series': ['8-Speed Automatic'],
        'X3': ['8-Speed Automatic'],
        'X5': ['8-Speed Automatic']
      },
      'Tesla': {
        'Model S': ['Single Speed'],
        'Model 3': ['Single Speed'],
        'Model X': ['Single Speed'],
        'Model Y': ['Single Speed']
      }
    };

    // Get transmissions for specific make/model combination
    if ((transmissionPatterns as any)[make] && (transmissionPatterns as any)[make][model]) {
      return (transmissionPatterns as any)[make][model];
    }

    // Fallback to common transmissions
    return ['Automatic', 'Manual', 'CVT', 'Semi-Automatic', 'Other'];
  };

  // Dynamic fuel types based on make/model/year
  const getFuelTypes = (make: any, model: any, year: any) => {
    // Test with Honda CR-V to verify the system works
    if (make === 'Honda' && model === 'CR-V') {
      return ['Gasoline', 'Hybrid'];
    }

    // Define fuel types for specific make/model combinations
    const fuelTypePatterns = {
      'Toyota': {
        'Camry': ['Gasoline', 'Hybrid'],
        'Corolla': ['Gasoline', 'Hybrid'],
        'RAV4': ['Gasoline', 'Hybrid', 'Plug-in Hybrid'],
        'Prius': ['Hybrid', 'Plug-in Hybrid'],
        'Highlander': ['Gasoline', 'Hybrid'],
        'Tacoma': ['Gasoline'],
        'Tundra': ['Gasoline', 'Hybrid']
      },
      'Honda': {
        'Civic': ['Gasoline'],
        'Accord': ['Gasoline', 'Hybrid'],
        'CR-V': ['Gasoline', 'Hybrid'],
        'Pilot': ['Gasoline'],
        'HR-V': ['Gasoline'],
        'Passport': ['Gasoline'],
        'Ridgeline': ['Gasoline'],
        'Odyssey': ['Gasoline'],
        'Insight': ['Hybrid'],
        'Fit': ['Gasoline']
      },
      'Ford': {
        'F-150': ['Gasoline', 'Hybrid'],
        'Escape': ['Gasoline', 'Hybrid'],
        'Explorer': ['Gasoline', 'Hybrid'],
        'Mustang': ['Gasoline'],
        'Focus': ['Gasoline'],
        'Edge': ['Gasoline'],
        'Bronco': ['Gasoline']
      },
      'BMW': {
        '3 Series': ['Gasoline', 'Hybrid'],
        '5 Series': ['Gasoline', 'Hybrid'],
        'X3': ['Gasoline', 'Hybrid'],
        'X5': ['Gasoline', 'Hybrid']
      },
      'Tesla': {
        'Model S': ['Electric'],
        'Model 3': ['Electric'],
        'Model X': ['Electric'],
        'Model Y': ['Electric']
      }
    };

    // Get fuel types for specific make/model combination
    if ((fuelTypePatterns as any)[make] && (fuelTypePatterns as any)[make][model]) {
      return (fuelTypePatterns as any)[make][model];
    }

    // Fallback to common fuel types
    return ['Gasoline', 'Diesel', 'Hybrid', 'Electric', 'E85', 'LPG', 'Other'];
  };

  // Available years (2000-2024)
  const availableYears = [
    ...Array.from({ length: 26 }, (_, i) => 2025 - i),
    'Other (before 2000)'
  ];

  // Generate makes available by year (simplified - all makes available for all years)
  const getMakesByYear = (year: any) => {
    return ['Toyota', 'Honda', 'Ford', 'BMW', 'Tesla', 'Chevrolet', 'Nissan', 'Hyundai', 'Kia', 'Audi', 'Mercedes-Benz', 'Lexus', 'Volkswagen', 'Mazda', 'Subaru', 'Acura']
      .slice()
      .sort((a, b) => a.localeCompare(b));
  };

  // Get models by year and make (simplified - use existing carModels data)
  const getModelsByYearAndMake = (year: any, make: any) => {
    if (!year || !make) return [];
    const modelsForMake = carModels[make] || [];

    // If we have year ranges per model, filter accordingly; otherwise return all
    const availableForYear = modelsForMake.filter((model) => {
      const makeYears = modelYears[make];
      if (!makeYears || !makeYears[model]) return true;
      return makeYears[model].includes(Number(year));
    });

    return availableForYear.slice().sort((a, b) => a.localeCompare(b));
  };

  // Model year ranges for each make/model combination (keeping for backward compatibility)
  const modelYears = {
    'Toyota': {
      'Camry': Array.from({length: 25}, (_, i) => 2024 - i), // 2000-2024
      'Corolla': Array.from({length: 25}, (_, i) => 2024 - i), // 2000-2024
      'RAV4': Array.from({length: 25}, (_, i) => 2024 - i), // 2000-2024
      'Highlander': Array.from({length: 20}, (_, i) => 2024 - i), // 2005-2024
      'Prius': Array.from({length: 20}, (_, i) => 2024 - i), // 2005-2024
      'Tacoma': Array.from({length: 25}, (_, i) => 2024 - i), // 2000-2024
      'Tundra': Array.from({length: 25}, (_, i) => 2024 - i), // 2000-2024
      'Sienna': Array.from({length: 25}, (_, i) => 2024 - i), // 2000-2024
      '4Runner': Array.from({length: 25}, (_, i) => 2024 - i), // 2000-2024
      'Avalon': Array.from({length: 20}, (_, i) => 2024 - i), // 2005-2024
      'Yaris': Array.from({length: 15}, (_, i) => 2024 - i), // 2010-2024
      'C-HR': Array.from({length: 8}, (_, i) => 2024 - i), // 2017-2024
      'Venza': Array.from({length: 15}, (_, i) => 2024 - i), // 2010-2024
      'Sequoia': Array.from({length: 25}, (_, i) => 2024 - i), // 2000-2024
      'Land Cruiser': Array.from({length: 25}, (_, i) => 2024 - i), // 2000-2024
    },
    'Honda': {
      'Civic': Array.from({length: 25}, (_, i) => 2024 - i), // 2000-2024
      'Accord': Array.from({length: 25}, (_, i) => 2024 - i), // 2000-2024
      'CR-V': Array.from({length: 25}, (_, i) => 2024 - i), // 2000-2024
      'Pilot': Array.from({length: 20}, (_, i) => 2024 - i), // 2005-2024
      'HR-V': Array.from({length: 10}, (_, i) => 2024 - i), // 2015-2024
      'Passport': Array.from({length: 6}, (_, i) => 2024 - i), // 2019-2024
      'Ridgeline': Array.from({length: 20}, (_, i) => 2024 - i), // 2005-2024
      'Odyssey': Array.from({length: 25}, (_, i) => 2024 - i), // 2000-2024
      'Insight': Array.from({length: 15}, (_, i) => 2024 - i), // 2010-2024
      'Fit': Array.from({length: 15}, (_, i) => 2024 - i), // 2010-2024
      'Element': Array.from({length: 10}, (_, i) => 2011 - i), // 2002-2011
      'S2000': Array.from({length: 10}, (_, i) => 2009 - i), // 2000-2009
      'NSX': Array.from({length: 10}, (_, i) => 2022 - i), // 2013-2022
    },
    'Ford': {
      'F-150': Array.from({length: 25}, (_, i) => 2024 - i), // 2000-2024
      'Escape': Array.from({length: 25}, (_, i) => 2024 - i), // 2000-2024
      'Explorer': Array.from({length: 25}, (_, i) => 2024 - i), // 2000-2024
      'Expedition': Array.from({length: 25}, (_, i) => 2024 - i), // 2000-2024
      'Mustang': Array.from({length: 25}, (_, i) => 2024 - i), // 2000-2024
      'Focus': Array.from({length: 20}, (_, i) => 2018 - i), // 1999-2018
      'Fusion': Array.from({length: 15}, (_, i) => 2020 - i), // 2006-2020
      'Edge': Array.from({length: 15}, (_, i) => 2024 - i), // 2010-2024
      'Bronco': Array.from({length: 5}, (_, i) => 2024 - i), // 2020-2024
      'Ranger': Array.from({length: 20}, (_, i) => 2024 - i), // 2005-2024
      'Transit': Array.from({length: 15}, (_, i) => 2024 - i), // 2010-2024
      'EcoSport': Array.from({length: 8}, (_, i) => 2022 - i), // 2015-2022
      'Flex': Array.from({length: 10}, (_, i) => 2019 - i), // 2010-2019
      'Taurus': Array.from({length: 15}, (_, i) => 2019 - i), // 2005-2019
    },
    'BMW': {
      '3 Series': Array.from({length: 25}, (_, i) => 2024 - i), // 2000-2024
      '5 Series': Array.from({length: 25}, (_, i) => 2024 - i), // 2000-2024
      '7 Series': Array.from({length: 25}, (_, i) => 2024 - i), // 2000-2024
      'X1': Array.from({length: 15}, (_, i) => 2024 - i), // 2010-2024
      'X3': Array.from({length: 20}, (_, i) => 2024 - i), // 2005-2024
      'X5': Array.from({length: 20}, (_, i) => 2024 - i), // 2005-2024
      'X7': Array.from({length: 6}, (_, i) => 2024 - i), // 2019-2024
      'Z4': Array.from({length: 20}, (_, i) => 2024 - i), // 2005-2024
      'i3': Array.from({length: 10}, (_, i) => 2022 - i), // 2013-2022
      'i8': Array.from({length: 8}, (_, i) => 2020 - i), // 2013-2020
      'M2': Array.from({length: 10}, (_, i) => 2024 - i), // 2015-2024
      'M3': Array.from({length: 25}, (_, i) => 2024 - i), // 2000-2024
      'M4': Array.from({length: 10}, (_, i) => 2024 - i), // 2015-2024
      'M5': Array.from({length: 25}, (_, i) => 2024 - i), // 2000-2024
      'M8': Array.from({length: 6}, (_, i) => 2024 - i), // 2019-2024
    },
    'Tesla': {
      'Model S': Array.from({length: 12}, (_, i) => 2024 - i), // 2013-2024
      'Model 3': Array.from({length: 8}, (_, i) => 2024 - i), // 2017-2024
      'Model X': Array.from({length: 9}, (_, i) => 2024 - i), // 2016-2024
      'Model Y': Array.from({length: 5}, (_, i) => 2024 - i), // 2020-2024
      'Roadster': Array.from({length: 15}, (_, i) => 2024 - i), // 2010-2024
      'Cybertruck': Array.from({length: 1}, (_, i) => 2024 - i), // 2024
      'Semi': Array.from({length: 3}, (_, i) => 2024 - i), // 2022-2024
    },
    'Acura': {
      'ILX': Array.from({length: 12}, (_, i) => 2024 - i),
      'Integra': [
        // 1986-2001
        ...Array.from({ length: 16 }, (_, i) => 2001 - i),
        // 2023-2024
        2024, 2023
      ],
      'Legend': Array.from({length: 10}, (_, i) => 1995 - i),
      'MDX': Array.from({length: 20}, (_, i) => 2024 - i),
      'NSX': Array.from({length: 10}, (_, i) => 2022 - i),
      'RDX': Array.from({length: 15}, (_, i) => 2024 - i),
      'RL': Array.from({length: 10}, (_, i) => 2012 - i),
      'RLX': Array.from({length: 8}, (_, i) => 2020 - i),
      'RSX': Array.from({length: 8}, (_, i) => 2006 - i),
      'TL': Array.from({length: 15}, (_, i) => 2014 - i),
      'TLX': Array.from({length: 10}, (_, i) => 2024 - i),
      'TSX': Array.from({length: 10}, (_, i) => 2014 - i),
    },
    // Add default fallback for other makes
    'Other': {
      'Custom': Array.from({length: 25}, (_, i) => 2024 - i),
      'Kit Car': Array.from({length: 25}, (_, i) => 2024 - i),
      'Modified': Array.from({length: 25}, (_, i) => 2024 - i),
      'Replica': Array.from({length: 25}, (_, i) => 2024 - i),
      'Restored': Array.from({length: 25}, (_, i) => 2024 - i),
    }
  };

  // Step management functions
  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return carInfo.make && carInfo.model && carInfo.year;
      case 2:
        return true; // All fields optional in step 2
      default:
        return false;
    }
  };

  const goToNextStep = () => {
    if (canProceedToNext() && currentStep < 2) {
      setCompletedSteps(prev => [...prev, currentStep]);
      setCurrentStep(prev => prev + 1);
    } else if (currentStep === 2) {
      // Complete the vehicle addition
      handleSave();
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Vehicle management functions
  const startAddingVehicle = () => {
    setScreenMode('addVehicle');
    setCurrentStep(1);
    setCarInfo({
      make: '',
      model: '',
      year: '',
      nickname: '',
      vin: '',
      mileage: '',
      color: '',
      licensePlate: '',
      trim: '',
      bodyStyle: '',
      drivetrain: '',
      engineType: '',
      transmission: '',
      fuelType: '',
      lastServiceDate: '',
      issues: '',
      serviceHistory: '',
    });
  };

  const editVehicle = (vehicle) => {
    setScreenMode('addVehicle');
    setCurrentStep(1);
    setCarInfo({
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      nickname: vehicle.nickname || '',
      vin: vehicle.vin || '',
      mileage: vehicle.mileage || '',
      color: vehicle.color || '',
      licensePlate: vehicle.licensePlate || '',
      trim: vehicle.trim || '',
      bodyStyle: vehicle.bodyStyle || '',
      drivetrain: vehicle.drivetrain || '',
      engineType: vehicle.engineType || '',
      transmission: vehicle.transmission || '',
      fuelType: vehicle.fuelType || '',
      lastServiceDate: vehicle.lastServiceDate || '',
      issues: vehicle.issues || '',
      serviceHistory: vehicle.serviceHistory || '',
    });
  };

  const handleDeleteVehicle = (vehicleId) => {
    Alert.alert(
      'Delete Vehicle',
      'Are you sure you want to delete this vehicle?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteVehicle(vehicleId);
              goBackToGarage();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete vehicle');
            }
          }
        }
      ]
    );
  };

  const goBackToGarage = () => {
    setScreenMode('garage');
    setCurrentStep(1);
  };

  const handleInputChange = (field, value) => {
    setCarInfo(prev => {
      const newCarInfo = { ...prev, [field]: value };
      
      // If year is changed, clear all dependent fields
      if (field === 'year') {
        newCarInfo.make = '';
        newCarInfo.model = '';
        newCarInfo.trim = '';
        newCarInfo.bodyStyle = '';
        newCarInfo.drivetrain = '';
        newCarInfo.engineType = '';
        newCarInfo.transmission = '';
        newCarInfo.fuelType = '';
      }
      
      // If make is changed, clear dependent fields
      if (field === 'make') {
        newCarInfo.model = '';
        newCarInfo.trim = '';
        newCarInfo.bodyStyle = '';
        newCarInfo.drivetrain = '';
        newCarInfo.engineType = '';
        newCarInfo.transmission = '';
        newCarInfo.fuelType = '';
      }
      
      // If model is changed, clear dependent fields
      if (field === 'model') {
        newCarInfo.trim = '';
        newCarInfo.bodyStyle = '';
        newCarInfo.drivetrain = '';
        newCarInfo.engineType = '';
        newCarInfo.transmission = '';
        newCarInfo.fuelType = '';
      }
      
      // If trim is changed, clear dependent fields
      if (field === 'trim') {
        newCarInfo.bodyStyle = '';
        newCarInfo.drivetrain = '';
        newCarInfo.engineType = '';
        newCarInfo.transmission = '';
        newCarInfo.fuelType = '';
      }
      
      return newCarInfo;
    });
  };

  const openDropdownModal = (field, options, placeholder) => {
    setCurrentField(field);
    
    // If it's the year field, show all available years
    if (field === 'year') {
      setCurrentOptions(availableYears);
    }
    // If it's the make field, get makes based on selected year
    else if (field === 'make') {
      const selectedYear = carInfo.year;
      if (selectedYear) {
        setCurrentOptions(getMakesByYear(selectedYear));
      } else {
        setCurrentOptions(['Please select a year first']);
      }
    } 
    // If it's the model field, get models based on selected year and make
    else if (field === 'model') {
      const selectedYear = carInfo.year;
      const selectedMake = carInfo.make;
      
      if (selectedYear && selectedMake) {
        setCurrentOptions(getModelsByYearAndMake(selectedYear, selectedMake));
      } else {
        setCurrentOptions(['Please select year and make first']);
      }
    }
    // If it's the trim field, get trims based on selected make, model, and year
    else if (field === 'trim') {
      const selectedMake = carInfo.make;
      const selectedModel = carInfo.model;
      const selectedYear = carInfo.year;
      
      if (selectedMake && selectedModel) {
        setCurrentOptions(getTrimLevels(selectedMake, selectedModel, selectedYear));
      } else {
        setCurrentOptions(['Please select make and model first']);
      }
    }
    // If it's the bodyStyle field, get body styles based on selected make and model
    else if (field === 'bodyStyle') {
      const selectedMake = carInfo.make;
      const selectedModel = carInfo.model;
      
      if (selectedMake && selectedModel) {
        setCurrentOptions(getBodyStyles(selectedMake, selectedModel));
      } else {
        setCurrentOptions(['Please select make and model first']);
      }
    }
    // If it's the drivetrain field, get drivetrains based on selected make, model, and year
    else if (field === 'drivetrain') {
      const selectedMake = carInfo.make;
      const selectedModel = carInfo.model;
      const selectedYear = carInfo.year;
      
      if (selectedMake && selectedModel) {
        setCurrentOptions(getDrivetrains(selectedMake, selectedModel, selectedYear));
      } else {
        setCurrentOptions(['Please select make and model first']);
      }
    }
    // If it's the engineType field, get engine types based on selected make, model, and year
    else if (field === 'engineType') {
      const selectedMake = carInfo.make;
      const selectedModel = carInfo.model;
      const selectedYear = carInfo.year;
      
      if (selectedMake && selectedModel) {
        setCurrentOptions(getEngineTypes(selectedMake, selectedModel, selectedYear));
      } else {
        setCurrentOptions(['Please select make and model first']);
      }
    }
    // If it's the transmission field, get transmissions based on selected make, model, and year
    else if (field === 'transmission') {
      const selectedMake = carInfo.make;
      const selectedModel = carInfo.model;
      const selectedYear = carInfo.year;
      
      if (selectedMake && selectedModel) {
        setCurrentOptions(getTransmissions(selectedMake, selectedModel, selectedYear));
      } else {
        setCurrentOptions(['Please select make and model first']);
      }
    }
    // If it's the fuelType field, get fuel types based on selected make, model, and year
    else if (field === 'fuelType') {
      const selectedMake = carInfo.make;
      const selectedModel = carInfo.model;
      const selectedYear = carInfo.year;
      
      if (selectedMake && selectedModel) {
        setCurrentOptions(getFuelTypes(selectedMake, selectedModel, selectedYear));
      } else {
        setCurrentOptions(['Please select make and model first']);
      }
    }
    else {
      setCurrentOptions(options);
    }
    
    setCurrentPlaceholder(placeholder);
    setShowDropdownModal(true);
  };

  const openTextInputModal = (field, placeholder) => {
    setCurrentField(field);
    setCurrentPlaceholder(placeholder);
    setInputValue(carInfo[field] || '');
    setShowTextInputModal(true);
  };

  const handleDropdownSelection = (option) => {
    // Don't allow selection of placeholder text
    if (option === 'Please select a make first' || 
        option === 'Please select make and model first' ||
        option === 'Please select make and model first') {
      return;
    }
    // If selecting 'Other' for year, open numeric input instead of setting directly
    if (currentField === 'year' && typeof option === 'string' && option.toLowerCase().includes('other')) {
      setShowDropdownModal(false);
      openTextInputModal('year', 'Year (before 2000)');
      return;
    }
    
    handleInputChange(currentField, option);
    setShowDropdownModal(false);
  };

  const handleTextInputSave = () => {
    // Validate custom year input
    if (currentField === 'year') {
      const parsed = parseInt(inputValue, 10);
      if (isNaN(parsed) || parsed > 1999 || parsed < 1900) {
        Alert.alert('Invalid Year', 'Please enter a year between 1900 and 1999.');
        return;
      }
      handleInputChange('year', String(parsed));
      setShowTextInputModal(false);
      setShowDropdownModal(false);
      return;
    }

    handleInputChange(currentField, inputValue);
    setShowTextInputModal(false);
  };

  const handleSave = async () => {
    if (!carInfo.make || !carInfo.model || !carInfo.year) {
      Alert.alert('Error', 'Please fill in at least Make, Model, and Year');
      return;
    }

    setLoading(true);
    try {
      // In a real app, this would save to the backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add to saved vehicles
      const newVehicle = {
        id: Date.now().toString(),
        make: carInfo.make,
        model: carInfo.model,
        year: carInfo.year,
        trim: carInfo.trim,
        color: carInfo.color,
        mileage: carInfo.mileage,
        licensePlate: carInfo.licensePlate,
        nickname: carInfo.nickname || `${carInfo.year} ${carInfo.make} ${carInfo.model}`,
        lastServiceDate: carInfo.lastServiceDate,
        vin: carInfo.vin,
        bodyStyle: carInfo.bodyStyle,
        drivetrain: carInfo.drivetrain,
        engineType: carInfo.engineType,
        transmission: carInfo.transmission,
        fuelType: carInfo.fuelType,
        issues: carInfo.issues,
        serviceHistory: carInfo.serviceHistory,
        image: null
      };
      
      await addVehicle(newVehicle);
      
      Alert.alert(
        'Success',
        'Vehicle added to your garage successfully!',
        [{ text: 'OK', onPress: () => goBackToGarage() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save vehicle information');
    } finally {
      setLoading(false);
    }
  };

  const renderDropdown = (field, options, placeholder) => {
    let displayText = carInfo[field] || `Select ${placeholder}`;
    let isDisabled = false;
    
    // Special handling for year field
    if (field === 'year' && !carInfo.year) {
      displayText = 'Select Year';
    }
    
    // Special handling for make field
    if (field === 'make' && !carInfo.year) {
      displayText = 'Select Year first';
      isDisabled = true;
    } else if (field === 'make' && carInfo.year && !carInfo.make) {
      displayText = 'Select Make';
    }
    
    // Special handling for model field
    if (field === 'model' && (!carInfo.year || !carInfo.make)) {
      displayText = 'Select Year and Make first';
      isDisabled = true;
    } else if (field === 'model' && carInfo.year && carInfo.make && !carInfo.model) {
      displayText = 'Select Model';
    }
    
    // Special handling for trim field
    if (field === 'trim' && (!carInfo.year || !carInfo.make || !carInfo.model)) {
      displayText = 'Select Year, Make and Model first';
      isDisabled = true;
    } else if (field === 'trim' && carInfo.year && carInfo.make && carInfo.model && !carInfo.trim) {
      displayText = 'Select Trim Level';
    }
    
    // Special handling for bodyStyle field
    if (field === 'bodyStyle' && (!carInfo.make || !carInfo.model)) {
      displayText = 'Select Make and Model first';
      isDisabled = true;
    } else if (field === 'bodyStyle' && carInfo.make && carInfo.model && !carInfo.bodyStyle) {
      displayText = 'Select Body Style';
    }
    
    // Special handling for drivetrain field
    if (field === 'drivetrain' && (!carInfo.make || !carInfo.model)) {
      displayText = 'Select Make and Model first';
      isDisabled = true;
    } else if (field === 'drivetrain' && carInfo.make && carInfo.model && !carInfo.drivetrain) {
      displayText = 'Select Drivetrain';
    }
    
    return (
    <View style={styles.inputGroup}>
      <Text style={[styles.inputLabel, { color: theme.text }]}>
        {placeholder}
      </Text>
      <TouchableOpacity
          style={[
            styles.dropdown, 
            { 
              borderColor: theme.border, 
              backgroundColor: theme.cardBackground,
              opacity: isDisabled ? 0.6 : 1
            }
          ]}
          onPress={() => openDropdownModal(field, options, placeholder)}
          disabled={isDisabled}
      >
        <Text style={[styles.dropdownText, { color: carInfo[field] ? theme.text : theme.textSecondary }]}>
            {displayText}
        </Text>
        <IconFallback name="arrow-drop-down" size={24} color={theme.textSecondary} />
      </TouchableOpacity>
    </View>
  );
  };

  const renderTextInput = (field, placeholder, keyboardType = 'default') => (
    <View style={styles.inputGroup}>
      <Text style={[styles.inputLabel, { color: theme.text }]}>
        {placeholder}
      </Text>
      <TouchableOpacity
        style={[styles.textInput, { borderColor: theme.border, backgroundColor: theme.cardBackground }]}
        onPress={() => openTextInputModal(field, placeholder)}
      >
        <Text style={[styles.textInputText, { color: carInfo[field] ? theme.text : theme.textSecondary }]}>
          {carInfo[field] || `Enter ${placeholder}`}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Garage view rendering functions
  const renderGarageView = () => (
    <View style={styles.garageContainer}>
      <View style={styles.garageHeader}>
        <Text style={[styles.garageTitle, { color: theme.text }]}>
          My Garage
        </Text>
        <Text style={[styles.garageSubtitle, { color: theme.textSecondary }]}>
          {savedVehicles.length} vehicle{savedVehicles.length !== 1 ? 's' : ''} saved
        </Text>
      </View>

      <ScrollView style={styles.vehiclesList} showsVerticalScrollIndicator={false}>
        {savedVehicles.map((vehicle) => (
          <View key={vehicle.id} style={[styles.vehicleCard, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.vehicleHeader}>
              <View style={styles.vehicleInfo}>
                <Text style={[styles.vehicleNickname, { color: theme.text }]}>
                  {vehicle.nickname}
                </Text>
                <Text style={[styles.vehicleDetails, { color: theme.textSecondary }]}>
                  {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
                </Text>
                <Text style={[styles.vehicleMileage, { color: theme.textSecondary }]}>
                  {vehicle.mileage ? `${vehicle.mileage} miles` : 'Mileage not set'} • {vehicle.color}
                </Text>
              </View>
              <View style={styles.vehicleActions}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: theme.accentLight + '20' }]}
                  onPress={() => editVehicle(vehicle)}
                >
                  <IconFallback name="edit" size={16} color={theme.accentLight} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: theme.error + '20' }]}
                  onPress={() => handleDeleteVehicle(vehicle.id)}
                >
                  <IconFallback name="delete" size={16} color={theme.error} />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.vehicleFooter}>
              <View style={styles.vehicleStats}>
                <View style={styles.statItem}>
                  <IconFallback name="local-gas-station" size={16} color={theme.textSecondary} />
                  <Text style={[styles.statText, { color: theme.textSecondary }]}>
                    {vehicle.fuelType || 'Not set'}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <IconFallback name="schedule" size={16} color={theme.textSecondary} />
                  <Text style={[styles.statText, { color: theme.textSecondary }]}>
                    Last service: {vehicle.lastServiceDate || 'Never'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ))}

        {/* Add Vehicle Card */}
        <TouchableOpacity
          style={[styles.addVehicleCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
          onPress={startAddingVehicle}
        >
          <View style={styles.addVehicleContent}>
            <View style={[styles.addVehicleIcon, { backgroundColor: theme.accentLight + '20' }]}>
              <IconFallback name="add" size={24} color={theme.accentLight} />
            </View>
            <View style={styles.addVehicleText}>
              <Text style={[styles.addVehicleTitle, { color: theme.text }]}>
                Add New Vehicle
              </Text>
              <Text style={[styles.addVehicleSubtitle, { color: theme.textSecondary }]}>
                Add another vehicle to your garage
              </Text>
            </View>
            <IconFallback name="arrow-forward" size={20} color={theme.textSecondary} />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  // New step-based rendering functions
  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2].map((step) => (
        <View key={step} style={styles.stepContainer}>
          <View style={[
            styles.stepCircle,
            {
              backgroundColor: step <= currentStep ? theme.primary : theme.border,
              borderColor: step <= currentStep ? theme.primary : theme.border,
            }
          ]}>
            {step < currentStep ? (
              <IconFallback name="check" size={16} color={theme.onPrimary} />
            ) : (
              <Text style={[
                styles.stepNumber,
                { color: step <= currentStep ? theme.onPrimary : theme.textSecondary }
              ]}>
                {step}
              </Text>
            )}
          </View>
          {step < 2 && (
            <View style={[
              styles.stepLine,
              { backgroundColor: step < currentStep ? theme.primary : theme.border }
            ]} />
          )}
        </View>
      ))}
    </View>
  );

  const renderStepHeader = () => {
    const stepTitles = {
      1: 'Vehicle Information',
      2: 'Help Mechanics Help You'
    };

    return (
      <View style={styles.stepHeader}>
        <Text style={[styles.stepTitle, { color: theme.text }]}>
          {stepTitles[currentStep]}
        </Text>
        <Text style={[styles.stepSubtitle, { color: theme.textSecondary }]}>
          {currentStep === 1 ? 'Basic information required' : 'Optional details to help with diagnostics'}
        </Text>
      </View>
    );
  };

  const renderBasicInfoStep = () => (
    <View style={styles.stepContent}>
      <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
        <View style={styles.fieldRow}>
          {renderDropdown('year', availableYears, 'Year')}
        </View>
        <View style={styles.fieldRow}>
          {renderDropdown('make', [], 'Make')}
          {renderDropdown('model', [], 'Model')}
        </View>
        <View style={styles.fieldRow}>
          {renderDropdown('trim', getTrimLevels(carInfo.make, carInfo.model, carInfo.year), 'Trim Level')}
          {renderTextInput('mileage', 'Current Mileage', 'numeric')}
        </View>
      </View>
      
      {/* Optional: Add a note about additional details */}
      <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
        <View style={styles.infoCard}>
          <IconFallback name="info" size={20} color={theme.accentLight} />
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            Only basic information is required. The next step has optional details that help mechanics provide better service.
          </Text>
        </View>
      </View>
    </View>
  );

  const renderDetailedSpecsStep = () => (
    <View style={styles.stepContent}>
      {/* Essential Optional Info */}
      <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
        <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 16 }]}>
          Help Mechanics Help You (Optional)
        </Text>
        
        <View style={styles.fieldRow}>
          {renderTextInput('nickname', 'Vehicle Nickname')}
          {renderTextInput('color', 'Vehicle Color')}
        </View>
        
        <View style={styles.fieldRow}>
          {renderTextInput('licensePlate', 'License Plate')}
        </View>
      </View>

      {/* Quick Vehicle Details */}
      <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
        <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 16 }]}>
          Quick Details (Optional)
        </Text>
        
        <View style={styles.fieldRow}>
          {renderDropdown('fuelType', getFuelTypes(carInfo.make, carInfo.model, carInfo.year), 'Fuel Type')}
          {renderDropdown('bodyStyle', getBodyStyles(carInfo.make, carInfo.model), 'Body Style')}
        </View>
      </View>

      {/* Advanced Details - Collapsible */}
      <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
        <TouchableOpacity 
          style={styles.advancedHeader}
          onPress={() => toggleSection('advanced')}
        >
          <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 0 }]}>
            Advanced Details (Optional)
          </Text>
          <IconFallback 
            name={expandedSections.advanced ? "expand-less" : "expand-more"} 
            size={24} 
            color={theme.textSecondary} 
          />
        </TouchableOpacity>
        
        {expandedSections.advanced && (
          <View style={styles.advancedContent}>
            <View style={styles.fieldRow}>
              {renderDropdown('drivetrain', getDrivetrains(carInfo.make, carInfo.model, carInfo.year), 'Drivetrain')}
            </View>
            <View style={styles.fieldRow}>
              {renderDropdown('engineType', getEngineTypes(carInfo.make, carInfo.model, carInfo.year), 'Engine Type')}
              {renderDropdown('transmission', getTransmissions(carInfo.make, carInfo.model, carInfo.year), 'Transmission')}
            </View>
          </View>
        )}
      </View>
    </View>
  );


  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderBasicInfoStep();
      case 2:
        return renderDetailedSpecsStep();
      default:
        return null;
    }
  };

  const renderNavigationButtons = () => (
    <View style={styles.navigationButtons}>
      {currentStep > 1 && (
        <TouchableOpacity
          style={[styles.navButton, styles.backButton, { borderColor: theme.border }]}
          onPress={goToPreviousStep}
        >
          <IconFallback name="arrow-back" size={20} color={theme.textSecondary} />
          <Text style={[styles.navButtonText, { color: theme.textSecondary }]}>
            Back
          </Text>
        </TouchableOpacity>
      )}
      
      <TouchableOpacity
        style={[
          styles.navButton,
          styles.nextButton,
          {
            backgroundColor: canProceedToNext() ? theme.primary : theme.border,
            opacity: canProceedToNext() ? 1 : 0.6
          }
        ]}
        onPress={goToNextStep}
        disabled={!canProceedToNext()}
      >
        <Text style={[styles.navButtonText, { color: canProceedToNext() ? theme.onPrimary : theme.textSecondary }]}>
          {currentStep === 2 ? 'Complete' : 'Next'}
        </Text>
        {currentStep < 2 && (
          <IconFallback name="arrow-forward" size={20} color={canProceedToNext() ? theme.onPrimary : theme.textSecondary} />
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ModernHeader
        title={screenMode === 'garage' ? 'My Garage' : 'Add Vehicle'}
        subtitle={screenMode === 'garage' ? 'Manage your vehicles' : 'Help mechanics with diagnostics'}
        showBack={true}
        onBackPress={() => screenMode === 'garage' ? navigation.goBack() : goBackToGarage()}
        rightActions={screenMode === 'addVehicle' ? [
          { 
            icon: 'save', 
            onPress: handleSave,
            disabled: loading
          },
        ] : []}
      />

      {screenMode === 'garage' ? (
        renderGarageView()
      ) : (
        <>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {renderStepIndicator()}
            {renderStepHeader()}
            {renderStepContent()}
            
            {/* Diagnostic Tips */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Diagnostic Tips</Text>
              
              <View style={[styles.tipsCard, { backgroundColor: theme.cardBackground }]}>
                <View style={styles.tipItem}>
                  <IconFallback name="lightbulb" size={20} color={theme.warning} />
                  <Text style={[styles.tipText, { color: theme.textSecondary }]}>
                    Include specific symptoms like noises, vibrations, or warning lights
                  </Text>
                </View>
                <View style={styles.tipItem}>
                  <IconFallback name="schedule" size={20} color={theme.warning} />
                  <Text style={[styles.tipText, { color: theme.textSecondary }]}>
                    Mention when issues started and under what conditions
                  </Text>
                </View>
                <View style={styles.tipItem}>
                  <IconFallback name="build" size={20} color={theme.warning} />
                  <Text style={[styles.tipText, { color: theme.textSecondary }]}>
                    List any recent repairs or modifications
                  </Text>
                </View>
                <View style={styles.tipItem}>
                  <IconFallback name="info" size={20} color={theme.warning} />
                  <Text style={[styles.tipText, { color: theme.textSecondary }]}>
                    The more details you provide, the better mechanics can help
                  </Text>
                </View>
              </View>
            </View>

            {/* Bottom Spacing */}
            <View style={styles.bottomSpacing} />
          </ScrollView>

          {renderNavigationButtons()}
        </>
      )}

      {/* Dropdown Modal */}
      <Modal
        visible={showDropdownModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDropdownModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDropdownModal(false)}
        >
          <TouchableOpacity
            style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Select {currentPlaceholder}
              </Text>
              <TouchableOpacity
                onPress={() => setShowDropdownModal(false)}
                style={styles.closeButton}
              >
                <IconFallback name="close" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
              {currentOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionItem,
                    { 
                      borderBottomColor: theme.border,
                      backgroundColor: carInfo[currentField] === option ? theme.accentLight + '20' : 'transparent'
                    }
                  ]}
                  onPress={() => handleDropdownSelection(option)}
                >
                  <Text style={[
                    styles.optionText,
                    { 
                      color: carInfo[currentField] === option ? theme.accentLight : theme.text,
                      fontWeight: carInfo[currentField] === option ? '600' : '400'
                    }
                  ]}>
                    {option}
                  </Text>
                  {carInfo[currentField] === option && (
                    <IconFallback name="check" size={20} color={theme.accentLight} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Text Input Modal */}
      <Modal
        visible={showTextInputModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTextInputModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowTextInputModal(false)}
        >
          <TouchableOpacity
            style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Enter {currentPlaceholder}
              </Text>
              <TouchableOpacity
                onPress={() => setShowTextInputModal(false)}
                style={styles.closeButton}
              >
                <IconFallback name="close" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.modalTextInput,
                  { 
                    borderColor: theme.border,
                    backgroundColor: theme.background,
                    color: theme.text
                  }
                ]}
                value={inputValue}
                onChangeText={setInputValue}
                placeholder={`Enter ${currentPlaceholder}`}
                placeholderTextColor={theme.textSecondary}
                multiline={currentField === 'issues' || currentField === 'serviceHistory'}
                numberOfLines={currentField === 'issues' || currentField === 'serviceHistory' ? 4 : 1}
                autoFocus={true}
                keyboardType={currentField === 'year' ? 'numeric' : 'default'}
              />
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { borderColor: theme.border }]}
                onPress={() => setShowTextInputModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: theme.textSecondary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.navButton, { backgroundColor: theme.primary }]}
                onPress={handleTextInputSave}
              >
                <Text style={[styles.modalButtonText, { color: theme.onPrimary }]}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  // Step indicator styles
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    marginBottom: 10,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  stepLine: {
    width: 40,
    height: 2,
    marginHorizontal: 8,
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  stepSubtitle: {
    fontSize: 16,
  },
  stepContent: {
    marginBottom: 24,
  },
  // Card and field styles
  card: {
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  inputGroup: {
    flex: 1,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  dropdownText: {
    fontSize: 16,
    flex: 1,
  },
  textInput: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  textInputText: {
    fontSize: 16,
  },
  textArea: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 80,
  },
  textAreaText: {
    fontSize: 16,
    lineHeight: 24,
  },
  // Quick actions
  quickActions: {
    marginTop: 16,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  // Info card styles
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  // Navigation buttons
  navigationButtons: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 40,
    gap: 12,
    backgroundColor: 'transparent',
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  backButton: {
    borderWidth: 1,
  },
  nextButton: {
    // Primary button styling
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Section styles
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  tipsCard: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  tipText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 100,
  },
  // Garage styles
  garageContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  garageHeader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  garageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  garageSubtitle: {
    fontSize: 16,
  },
  vehiclesList: {
    flex: 1,
  },
  vehicleCard: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  vehicleInfo: {
    flex: 1,
    marginRight: 12,
  },
  vehicleNickname: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  vehicleDetails: {
    fontSize: 14,
    marginBottom: 2,
  },
  vehicleMileage: {
    fontSize: 12,
  },
  vehicleActions: {
    flexDirection: 'row',
    gap: 6,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleFooter: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
  },
  vehicleStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
  },
  addVehicleCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  addVehicleContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addVehicleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  addVehicleText: {
    flex: 1,
  },
  addVehicleTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  addVehicleSubtitle: {
    fontSize: 12,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  optionsList: {
    maxHeight: 300,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  optionText: {
    fontSize: 16,
    flex: 1,
  },
  inputContainer: {
    padding: 20,
  },
  modalTextInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 16,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Advanced section styles
  advancedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  advancedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
});
