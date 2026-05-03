// Temporary minimal Indonesian region data for Address Book flow.
// TODO(addressbook): Replace this local dataset with backend/API sourced region master data.
const REGION_TREE = [
  {
    province: 'JAWA BARAT',
    cities: [
      {
        city: 'KOTA BEKASI',
        districts: [
          { district: 'BEKASI UTARA', postalCodes: ['17121', '17124'] },
          { district: 'BEKASI SELATAN', postalCodes: ['17141'] },
        ],
      },
      {
        city: 'KABUPATEN BEKASI',
        districts: [
          { district: 'TAMBUN SELATAN', postalCodes: ['17510'] },
        ],
      },
    ],
  },
  {
    province: 'DKI JAKARTA',
    cities: [
      {
        city: 'JAKARTA SELATAN',
        districts: [
          { district: 'KEBAYORAN BARU', postalCodes: ['12130'] },
        ],
      },
    ],
  },
]

export const getProvinceOptions = () => REGION_TREE.map((item) => item.province)

export const getCityOptions = (province) => REGION_TREE.find((item) => item.province === province)?.cities?.map((item) => item.city) ?? []

export const getDistrictOptions = (province, city) =>
  REGION_TREE.find((item) => item.province === province)?.cities?.find((item) => item.city === city)?.districts?.map((item) => item.district) ?? []

export const getPostalCodeOptions = (province, city, district) =>
  REGION_TREE.find((item) => item.province === province)?.cities?.find((item) => item.city === city)?.districts?.find((item) => item.district === district)?.postalCodes ?? []
