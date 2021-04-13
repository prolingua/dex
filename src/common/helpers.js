/* import React from "react";
import { connect } from "react-redux";
import moment from 'moment';
import { FormCheck, Form, Image, Row, Col, Button, Badge } from "react-bootstrap";
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { selectFilter } from 'react-bootstrap-table2-filter';
import {
  TimesCircleIcon,
  BarsIcon,
  ShippingFastIcon,
  DashboardIcon,
  AppleIcon,
  TicketIcon,
  ListAltIcon,
  StoreAltIcon,
  HomeIcon,
  SignOutIcon,
  SitemapIcon
} from "react-line-awesome";
import { Dropdown } from 'semantic-ui-react';  */
import web3 from 'web3';

// import { Get, Patch, SavedModels } from "common/server";

/* import Loading from "app/pages/components/Loading";
import actions from "actions";
 */
import "styles/admin-sidebar-layout.css";

import {
  isEmail,
  isAlpha,
  isMobilePhone,
  isAscii,
  isDecimal,
  isAlphanumeric,
  isPostalCode,
  isEmpty
} from "validator";
import { isArray } from "lodash";
import ReactGA from "react-ga";

function GetUrlSegmentItem(index) {
  var segments = window.location.pathname.split('/');
  return segments[index];
}

function GetUrlParam(name) {
  var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
  if (results == null) {
    return null;
  }
  else {    
    return decodeURI(results[1]) || 0;
  }
}

function ArrayContainsSomeFromAnotherArray(arr1, arr2) {
  let isFounded = arr1.some(ai => arr2.includes(ai));
  return isFounded;
}

// given an array of objects
// return an array of selected props from that object
// e.g.
// haystack = [{name:"John", age:40, gender:"m"}, {name:"Bill", age:30, gender:"f"}]
// needles = ["name", "gender"]
// result = [{name:"John", gender:"m"}, {name:"Bill", gender:"f"}]
function ExtractMultiplePropsFromArrayOfObjects(needles, haystack) {
  let result = haystack.map((hay) => {
    var lessHay = {};

    needles.forEach(i => {
      lessHay[i] = hay[i];
    });

    return lessHay;
  });

  return result;
}

// function LoadingSpinner() {
//   return (
//     <div className="spinner-border spinner-border-sm" role="status">
//       <span className="sr-only">Loading...</span>
//     </div>
//   );
// }

function ObjectHasEmptyNonBoolProp(obj) {
  var isEmptyObject = true;

  for (var key in obj) {
    isEmptyObject = false;

    if (!obj[key]) {
      return true;
    }
  }

  if (isEmptyObject) {
    return true;
  }

  return false;
}

function GetValueFromNestedObject(selectionArray, obj) {
  selectionArray.forEach(key => {
    obj = obj[key];
  });
  return obj;
}

function DeepCleanObject(obj, numberDefault, stringDefault, boolDefault) {

  for (let [key, value] of Object.entries(obj)) {
    let propType = typeof (obj[key]);

    switch (propType) {
      case "number":
        obj[key] = numberDefault;
        break;

      case "string":
        obj[key] = stringDefault;
        break;

      case "boolean":
        obj[key] = boolDefault;
        break;

      case "undefined":
        obj[key] = null;
        break;

      default: // must be an object/array
        if (value === null || value === undefined) {
          continue;
        }

        let innerObj = obj[key];
        let isArray = Array.isArray(innerObj);
        
        if(isArray) {
          while(innerObj.length > 0) {
            innerObj.pop();
          }
        }
        else {
          DeepCleanObject(innerObj, numberDefault, stringDefault, boolDefault);
        }        
        break;

    }
  }
}

function GetEnv() {
  var url = window.location.href;

  var env =
    url.indexOf('localhost') > -1
      ? 'dev'
      : url.indexOf('admin-test.tectrack.co.uk') > -1
        ? 'test'
        : 'live';

  return env;
}

function jsFind(searchObject, s1, s2) {
  var found = {};
  for (var i = 0; i < searchObject.length; i++) {
    var types = searchObject[i].types;

    if (s1 !== '' && s2 !== '' && types.length > 1) {
      if (types[0] === s1 && types[1] === s2) {
        found = searchObject[i];
        return found;
      }
    }

    if (s1 !== '' && s2 === '') {
      if (types[0] === s1) {
        found = searchObject[i];
        return found;
      }
    }

    if (s1 === s2) {
      if (types.length === 1) {
        if (types[0] === s1) {
          found = searchObject[i];
          return found;
        }
      }

      if (types.length === 2) {
        if (types[0] === s1 || types[1] === s2) {
          found = searchObject[i];
          return found;
        }
      }
    }
  }

  return found;
}

function nullCheck(value) {
  return value.long_name === undefined ? { long_name: '' } : value;
}

function IsNullOrUndefinedOrEmpty(str) {
  return str === undefined || str === '' || str === null;
}

function RetrieveFromGoogleAddress(addressComponent, fullAddressObj) {
  var country = jsFind(fullAddressObj, 'country', 'political');

  switch (addressComponent) {
    case 'line1':
      var part1 = jsFind(fullAddressObj, 'street_number', '');
      part1 = nullCheck(part1);

      var part2 = jsFind(fullAddressObj, 'route', '');
      part2 = nullCheck(part2);

      return part1.long_name + ' ' + part2.long_name;

    case 'town':
      var town = jsFind(fullAddressObj, 'locality', 'political');
      town = nullCheck(town);
      return town.short_name;

    case 'city':
      var city = {};

      switch (country.short_name) {
        case 'GB':
          city = jsFind(fullAddressObj, 'postal_town', '');
          break;

        default:
          city = jsFind(fullAddressObj, 'locality', 'political');
      }

      city = nullCheck(city);
      return city.long_name;

    case 'stateCountyRegion':
      var scr = {};

      switch (country.short_name) {
        case 'GB':
          scr = jsFind(
            fullAddressObj,
            'administrative_area_level_2',
            'political'
          );
          //fullAddressObj.find(x => x.types[0] === "administrative_area_level_2" && x.types[1] === "political");
          break;

        case 'US': // us requires short name so return now
          scr = jsFind(
            fullAddressObj,
            'administrative_area_level_1',
            'political'
          );
          scr = nullCheck(scr);
          return scr.short_name;

        default:
          scr = jsFind(
            fullAddressObj,
            'administrative_area_level_1',
            'political'
          );
          break;
      }

      scr = nullCheck(scr);
      return scr.long_name;

    case 'country':
      return country.short_name;

    case 'postCodeZip':
      // when a postcode is incomplete e.g. M14 instead of M14 6SE
      // it pushes the type of postal_code_prefix before type postal_code because its evil like that
      var pcz = jsFind(fullAddressObj, 'postal_code', 'postal_code'); //fullAddressObj.find(x => x.types[0] === "postal_code" || x.types[1] === "postal_code");
      pcz = nullCheck(pcz);
      return pcz.long_name;

    default:
      // shouldnt get here since we can control and dont pass in any unknown cases
      break;
  }
  /**/
}

function DisplayInfoDialog(dispatchProps, title, message, size = "md") {
  dispatchProps.changeState([
    { path: ['modal', 'open'], value: true },
    { path: ['modal', 'header'], value: title },
    { path: ['modal', 'body'], value: message },
    { path: ['modal', 'size'], value: size },
    { path: ['modal', 'content'], value: 'InfoDialog' },
    { path: ['modal', 'loading'], value: false },

    { path: ['dimmer'], value: false },
    { path: ['dataIsLoading'], value: false }
  ]);
}

function GetClaimsFromToken(token) {
  var base64Url = token?.split('.')[1];
  if (base64Url) {
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
  }
  return {};
}

function GetExpiryDateFromFoken(token) {
  console.log(token)
  var base64Url = token?.split('.')[1];
  console.log(base64Url)
  if (base64Url) {
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
  }
  return {};
}

function FancyTitles(type) {
  var possibleTitles = {
    error: ['Error'],
    warning: ['Warning'],
    success: ['Success']
  };

  var m = possibleTitles[type].length - 1;

  var min = Math.ceil(0);
  var max = Math.floor(m);

  var randomInt = Math.floor(Math.random() * (max - min + 1)) + min;

  return possibleTitles[type][randomInt];
}

// should take this definition from Models
let userDefinition = {
  username: "",
  password: "",
  email: "",
  firstName: "",
  lastName: "",
  phone: ""
};

function ValidateUser(user = userDefinition) {
  var fname = user.firstName;
  fname = fname.replace(/\s/g, '');
  fname = fname.replace(/-/g, '');
  fname = fname.replace(/'/g, '');

  var fnameError = !isAlpha(fname);

  var lname = user.lastName;
  lname = lname.replace(/\s/g, '');
  lname = lname.replace(/-/g, '');
  lname = lname.replace(/'/g, '');
  var lnameError = !isAlpha(lname);

  var email = user.email;
  var emailError = !isEmail(email);

  var phone = user.phone;
  var phoneError = !isMobilePhone(phone);

  var username = user.username;
  var usernameError = !isAlphanumeric(username);

  var password = user.password;
  var passwordError = !isAscii(password);

  var validation = [
    { key: "firstName", error: fnameError },
    { key: "lastName", error: lnameError },
    { key: "email", error: emailError },
    { key: "phone", error: phoneError },
    { key: "username", error: usernameError },
    { key: "password", error: passwordError }
  ];

  return validation;
}

function ValidateItem(item) {
  var name = item.name ? item.name : "";
  var nameError = isEmpty(name);

  var categories = item.categories;
  var categoryError = categories === undefined || categories?.length === 0;
  var price = item.price ? item.price : "";
  var priceError = !isDecimal(price.toString());

  var validation = [
    { key: "name", error: nameError },
    { key: "category", error: categoryError },
    { key: "price", error: priceError }
  ];

  return validation;
}



function ValidateDeliveryOption(option) {
  var name = option.name ? option.name : "";
  var nameError = isEmpty(name);

  var price = option.price ? option.price : 0;
  var priceError = !isDecimal(price.toString());

  var recommendationError = false;
  if (option.hasRecommendations) {
    recommendationError = option.recommendations.length === 0;
  }

  var validation = [
    { key: "name", error: nameError },
    { key: "price", error: priceError },
    { key: "recommendations", error: recommendationError }
  ];

  return validation;
}

function ValidateCoupon(coupon) {
  var code = coupon.code ? coupon.code : "";
  var codeError = isEmpty(code);

  var discount = coupon.discount ? coupon.discount : 0;
  var discountError = !isDecimal(discount.toString());

  // var price = item.price ? item.price : "";
  // var priceError = !isDecimal(price);

  var validation = [
    { key: "code", error: codeError },
    { key: "discount", error: discountError }
  ];

  return validation;
}

function ValidateAddress(address) {
  var line1Error = isEmpty(address.line1, { ignore_whitespace: true });
  //var line2Error = isEmpty(address.line2, { ignore_whitespace: true });
  var townCityError = isEmpty(address.townCity, { ignore_whitespace: true });
  var countyError = isEmpty(address.county, { ignore_whitespace: true });
  var postcodeError = !isPostalCode(address.postcode, "GB");

  var validation = [
    { key: "line1", error: line1Error },
    //{ key: "line2", error: line2Error },
    { key: "townCity", error: townCityError },
    { key: "county", error: countyError },
    { key: "postcode", error: postcodeError }
  ];

  return validation;
}

async function PauseWithDimmer(dispatchProps, millisecs) {

  dispatchProps.changeState(
    [{ path: ["dimmer"], value: true }]
  );

  await sleep(millisecs);

  dispatchProps.changeState(
    [{ path: ["dimmer"], value: false }]
  );

  // Sleep in loop
  // not sure I undertand the numbers in here but it does the sleep job...
  for (let i = 0; i < 5; i++) {
    if (i === 3) await sleep(millisecs);
  }
}

function LogOut(dispatchProps, url) {
  dispatchProps.resetState();
  localStorage.clear();
  dispatchProps.changePage(`/${url}`);
}

async function Poll(dispatchProps, millisecs) {

  // dispatchProps.changeState(
  //   [{ path: ["dimmer"], value: true }]
  // );

  await sleep(millisecs);

  // dispatchProps.changeState(
  //   [{ path: ["dimmer"], value: false }]
  // );

  // Sleep in loop
  // not sure I undertand the numbers in here but it does the sleep job...
  for (let i = 0; i < 5; i++) {
    if (i === 3) await sleep(millisecs);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function CountryOptionsFlags(key = "all") {
  const countryOptions = [
    { key: "", value: "", text: "Remove" },
    { key: "gb", value: "gb", flag: "gb", text: "United Kingdom" },
    { key: "ie", value: "ie", flag: "ie", text: "Republic of Ireland" },
    { key: "af", value: "af", flag: "af", text: "Afghanistan" },
    { key: "ax", value: "ax", flag: "ax", text: "Aland Islands" },
    { key: "al", value: "al", flag: "al", text: "Albania" },
    { key: "dz", value: "dz", flag: "dz", text: "Algeria" },
    { key: "as", value: "as", flag: "as", text: "American Samoa" },
    { key: "ad", value: "ad", flag: "ad", text: "Andorra" },
    { key: "ao", value: "ao", flag: "ao", text: "Angola" },
    { key: "ai", value: "ai", flag: "ai", text: "Anguilla" },
    { key: "ag", value: "ag", flag: "ag", text: "Antigua and Barbuda" },
    { key: "ar", value: "ar", flag: "ar", text: "Argentina" },
    { key: "am", value: "am", flag: "am", text: "Armenia" },
    { key: "aw", value: "aw", flag: "aw", text: "Aruba" },
    { key: "au", value: "au", flag: "au", text: "Australia" },
    { key: "at", value: "at", flag: "at", text: "Austria" },
    { key: "az", value: "az", flag: "az", text: "Azerbaijan" },
    { key: "bs", value: "bs", flag: "bs", text: "Bahamas" },
    { key: "bh", value: "bh", flag: "bh", text: "Bahrain" },
    { key: "bd", value: "bd", flag: "bd", text: "Bangladesh" },
    { key: "bb", value: "bb", flag: "bb", text: "Barbados" },
    { key: "by", value: "by", flag: "by", text: "Belarus" },
    { key: "be", value: "be", flag: "be", text: "Belgium" },
    { key: "bz", value: "bz", flag: "bz", text: "Belize" },
    { key: "bj", value: "bj", flag: "bj", text: "Benin" },
    { key: "bm", value: "bm", flag: "bm", text: "Bermuda" },
    { key: "bt", value: "bt", flag: "bt", text: "Bhutan" },
    { key: "bo", value: "bo", flag: "bo", text: "Bolivia (Plurinational State of)" },
    { key: "ba", value: "ba", flag: "ba", text: "Bosnia and Herzegovina" },
    { key: "bw", value: "bw", flag: "bw", text: "Botswana" },
    { key: "br", value: "br", flag: "br", text: "Brazil" },
    { key: "io", value: "io", flag: "io", text: "British Indian Ocean Territory" },
    { key: "bn", value: "bn", flag: "bn", text: "Brunei Darussalam" },
    { key: "bg", value: "bg", flag: "bg", text: "Bulgaria" },
    { key: "bf", value: "bf", flag: "bf", text: "Burkina Faso" },
    { key: "bi", value: "bi", flag: "bi", text: "Burundi" },
    { key: "cv", value: "cv", flag: "cv", text: "Cabo Verde" },
    { key: "kh", value: "kh", flag: "kh", text: "Cambodia" },
    { key: "cm", value: "cm", flag: "cm", text: "Cameroon" },
    { key: "ca", value: "ca", flag: "ca", text: "Canada" },
    { key: "ky", value: "ky", flag: "ky", text: "Cayman Islands" },
    { key: "cf", value: "cf", flag: "cf", text: "Central African Republic" },
    { key: "td", value: "td", flag: "td", text: "Chad" },
    { key: "cl", value: "cl", flag: "cl", text: "Chile" },
    { key: "cn", value: "cn", flag: "cn", text: "China" },
    { key: "co", value: "co", flag: "co", text: "Colombia" },
    { key: "km", value: "km", flag: "km", text: "Comoros" },
    { key: "cg", value: "cg", flag: "cg", text: "Congo" },
    { key: "cd", value: "cd", flag: "cd", text: "Congo (Democratic Republic of the)" },
    { key: "ck", value: "ck", flag: "ck", text: "Cook Islands" },
    { key: "cr", value: "cr", flag: "cr", text: "Costa Rica" },
    { key: "ci", value: "ci", flag: "ci", text: "Cote D'ivoire" },
    { key: "hr", value: "hr", flag: "hr", text: "Croatia" },
    { key: "cu", value: "cu", flag: "cu", text: "Cuba" },
    { key: "cy", value: "cy", flag: "cy", text: "Cyprus" },
    { key: "cz", value: "cz", flag: "cz", text: "Czechia" },
    { key: "dk", value: "dk", flag: "dk", text: "Denmark" },
    { key: "dj", value: "dj", flag: "dj", text: "Djibouti" },
    { key: "dm", value: "dm", flag: "dm", text: "Dominica" },
    { key: "do", value: "do", flag: "do", text: "Dominican Republic" },
    { key: "ec", value: "ec", flag: "ec", text: "Ecuador" },
    { key: "eg", value: "eg", flag: "eg", text: "Egypt" },
    { key: "sv", value: "sv", flag: "sv", text: "El Salvador" },
    { key: "gq", value: "gq", flag: "gq", text: "Equatorial Guinea" },
    { key: "er", value: "er", flag: "er", text: "Eritrea" },
    { key: "ee", value: "ee", flag: "ee", text: "Estonia" },
    { key: "sz", value: "sz", flag: "sz", text: "Eswatini" },
    { key: "et", value: "et", flag: "et", text: "Ethiopia" },
    { key: "fk", value: "fk", flag: "fk", text: "Falkland Islands (Malvinas)" },
    { key: "fo", value: "fo", flag: "fo", text: "Faroe Islands" },
    { key: "fj", value: "fj", flag: "fj", text: "Fiji" },
    { key: "fi", value: "fi", flag: "fi", text: "Finland" },
    { key: "fr", value: "fr", flag: "fr", text: "France" },
    { key: "gf", value: "gf", flag: "gf", text: "French Guiana" },
    { key: "pf", value: "pf", flag: "pf", text: "French Polynesia" },
    { key: "ga", value: "ga", flag: "ga", text: "Gabon" },
    { key: "gm", value: "gm", flag: "gm", text: "Gambia" },
    { key: "ge", value: "ge", flag: "ge", text: "Georgia" },
    { key: "de", value: "de", flag: "de", text: "Germany" },
    { key: "gh", value: "gh", flag: "gh", text: "Ghana" },
    { key: "gi", value: "gi", flag: "gi", text: "Gibraltar" },
    { key: "gr", value: "gr", flag: "gr", text: "Greece" },
    { key: "gl", value: "gl", flag: "gl", text: "Greenland" },
    { key: "gd", value: "gd", flag: "gd", text: "Grenada" },
    { key: "gp", value: "gp", flag: "gp", text: "Guadeloupe" },
    { key: "gu", value: "gu", flag: "gu", text: "Guam" },
    { key: "gt", value: "gt", flag: "gt", text: "Guatemala" },
    { key: "gn", value: "gn", flag: "gn", text: "Guinea" },
    { key: "gw", value: "gw", flag: "gw", text: "Guinea-Bissau" },
    { key: "gy", value: "gy", flag: "gy", text: "Guyana" },
    { key: "ht", value: "ht", flag: "ht", text: "Haiti" },
    { key: "va", value: "va", flag: "va", text: "Holy See" },
    { key: "hn", value: "hn", flag: "hn", text: "Honduras" },
    { key: "hk", value: "hk", flag: "hk", text: "Hong Kong" },
    { key: "hu", value: "hu", flag: "hu", text: "Hungary" },
    { key: "is", value: "is", flag: "is", text: "Iceland" },
    { key: "in", value: "in", flag: "in", text: "India" },
    { key: "id", value: "id", flag: "id", text: "Indonesia" },
    { key: "ir", value: "ir", flag: "ir", text: "Iran (Islamic Republic of)" },
    { key: "iq", value: "iq", flag: "iq", text: "Iraq" },
    { key: "il", value: "il", flag: "il", text: "Israel" },
    { key: "it", value: "it", flag: "it", text: "Italy" },
    { key: "jm", value: "jm", flag: "jm", text: "Jamaica" },
    { key: "jp", value: "jp", flag: "jp", text: "Japan" },
    { key: "jo", value: "jo", flag: "jo", text: "Jordan" },
    { key: "kz", value: "kz", flag: "kz", text: "Kazakhstan" },
    { key: "ke", value: "ke", flag: "ke", text: "Kenya" },
    { key: "ki", value: "ki", flag: "ki", text: "Kiribati" },
    { key: "kp", value: "kp", flag: "kp", text: "Korea (Democratic People's Republic of)" },
    { key: "kr", value: "kr", flag: "kr", text: "Korea (Republic of)" },
    { key: "kw", value: "kw", flag: "kw", text: "Kuwait" },
    { key: "kg", value: "kg", flag: "kg", text: "Kyrgyzstan" },
    { key: "la", value: "la", flag: "la", text: "Lao People's Democratic Republic" },
    { key: "lv", value: "lv", flag: "lv", text: "Latvia" },
    { key: "lb", value: "lb", flag: "lb", text: "Lebanon" },
    { key: "ls", value: "ls", flag: "ls", text: "Lesotho" },
    { key: "lr", value: "lr", flag: "lr", text: "Liberia" },
    { key: "ly", value: "ly", flag: "ly", text: "Libya" },
    { key: "li", value: "li", flag: "li", text: "Liechtenstein" },
    { key: "lt", value: "lt", flag: "lt", text: "Lithuania" },
    { key: "lu", value: "lu", flag: "lu", text: "Luxembourg" },
    { key: "mo", value: "mo", flag: "mo", text: "Macao" },
    { key: "mg", value: "mg", flag: "mg", text: "Madagascar" },
    { key: "mw", value: "mw", flag: "mw", text: "Malawi" },
    { key: "my", value: "my", flag: "my", text: "Malaysia" },
    { key: "mv", value: "mv", flag: "mv", text: "Maldives" },
    { key: "ml", value: "ml", flag: "ml", text: "Mali" },
    { key: "mt", value: "mt", flag: "mt", text: "Malta" },
    { key: "mh", value: "mh", flag: "mh", text: "Marshall Islands" },
    { key: "mq", value: "mq", flag: "mq", text: "Martinique" },
    { key: "mr", value: "mr", flag: "mr", text: "Mauritania" },
    { key: "mu", value: "mu", flag: "mu", text: "Mauritius" },
    { key: "yt", value: "yt", flag: "yt", text: "Mayotte" },
    { key: "mx", value: "mx", flag: "mx", text: "Mexico" },
    { key: "fm", value: "fm", flag: "fm", text: "Micronesia (Federated States of)" },
    { key: "md", value: "md", flag: "md", text: "Moldova (Republic of)" },
    { key: "mc", value: "mc", flag: "mc", text: "Monaco" },
    { key: "mn", value: "mn", flag: "mn", text: "Mongolia" },
    { key: "me", value: "me", flag: "me", text: "Montenegro" },
    { key: "ms", value: "ms", flag: "ms", text: "Montserrat" },
    { key: "ma", value: "ma", flag: "ma", text: "Morocco" },
    { key: "mz", value: "mz", flag: "mz", text: "Mozambique" },
    { key: "mm", value: "mm", flag: "mm", text: "Myanmar" },
    { key: "na", value: "na", flag: "na", text: "Namibia" },
    { key: "nr", value: "nr", flag: "nr", text: "Nauru" },
    { key: "np", value: "np", flag: "np", text: "Nepal" },
    { key: "nl", value: "nl", flag: "nl", text: "Netherlands" },
    { key: "nc", value: "nc", flag: "nc", text: "New Caledonia" },
    { key: "nz", value: "nz", flag: "nz", text: "New Zealand" },
    { key: "ni", value: "ni", flag: "ni", text: "Nicaragua" },
    { key: "ne", value: "ne", flag: "ne", text: "Niger" },
    { key: "ng", value: "ng", flag: "ng", text: "Nigeria" },
    { key: "nu", value: "nu", flag: "nu", text: "Niue" },
    { key: "nf", value: "nf", flag: "nf", text: "Norfolk Island" },
    { key: "mk", value: "mk", flag: "mk", text: "North Macedonia" },
    { key: "mp", value: "mp", flag: "mp", text: "Northern Mariana Islands" },
    { key: "no", value: "no", flag: "no", text: "Norway" },
    { key: "om", value: "om", flag: "om", text: "Oman" },
    { key: "pk", value: "pk", flag: "pk", text: "Pakistan" },
    { key: "pw", value: "pw", flag: "pw", text: "Palau" },
    { key: "ps", value: "ps", flag: "ps", text: "Palestine, State of" },
    { key: "pa", value: "pa", flag: "pa", text: "Panama" },
    { key: "pg", value: "pg", flag: "pg", text: "Papua New Guinea" },
    { key: "py", value: "py", flag: "py", text: "Paraguay" },
    { key: "pe", value: "pe", flag: "pe", text: "Peru" },
    { key: "ph", value: "ph", flag: "ph", text: "Philippines" },
    { key: "pl", value: "pl", flag: "pl", text: "Poland" },
    { key: "pt", value: "pt", flag: "pt", text: "Portugal" },
    { key: "pr", value: "pr", flag: "pr", text: "Puerto Rico" },
    { key: "qa", value: "qa", flag: "qa", text: "Qatar" },
    { key: "re", value: "re", flag: "re", text: "Reunion" },
    { key: "ro", value: "ro", flag: "ro", text: "Romania" },
    { key: "ru", value: "ru", flag: "ru", text: "Russian Federation" },
    { key: "rw", value: "rw", flag: "rw", text: "Rwanda" },
    { key: "kn", value: "kn", flag: "kn", text: "Saint Kitts and Nevis" },
    { key: "lc", value: "lc", flag: "lc", text: "Saint Lucia" },
    { key: "pm", value: "pm", flag: "pm", text: "Saint Pierre and Miquelon" },
    { key: "vc", value: "vc", flag: "vc", text: "Saint Vincent and The Grenadines" },
    { key: "ws", value: "ws", flag: "ws", text: "Samoa" },
    { key: "sm", value: "sm", flag: "sm", text: "San Marino" },
    { key: "st", value: "st", flag: "st", text: "Sao Tome and Principe" },
    { key: "sa", value: "sa", flag: "sa", text: "Saudi Arabia" },
    { key: "sn", value: "sn", flag: "sn", text: "Senegal" },
    { key: "rs", value: "rs", flag: "rs", text: "Serbia" },
    { key: "sc", value: "sc", flag: "sc", text: "Seychelles" },
    { key: "sl", value: "sl", flag: "sl", text: "Sierra Leone" },
    { key: "sg", value: "sg", flag: "sg", text: "Singapore" },
    { key: "sk", value: "sk", flag: "sk", text: "Slovakia" },
    { key: "si", value: "si", flag: "si", text: "Slovenia" },
    { key: "sb", value: "sb", flag: "sb", text: "Solomon Islands" },
    { key: "so", value: "so", flag: "so", text: "Somalia" },
    { key: "za", value: "za", flag: "za", text: "South Africa" },
    { key: "es", value: "es", flag: "es", text: "Spain" },
    { key: "lk", value: "lk", flag: "lk", text: "Sri Lanka" },
    { key: "sd", value: "sd", flag: "sd", text: "Sudan" },
    { key: "sr", value: "sr", flag: "sr", text: "Suriname" },
    { key: "sj", value: "sj", flag: "sj", text: "Svalbard and Jan Mayen" },
    { key: "se", value: "se", flag: "se", text: "Sweden" },
    { key: "ch", value: "ch", flag: "ch", text: "Switzerland" },
    { key: "sy", value: "sy", flag: "sy", text: "Syrian Arab Republic" },
    { key: "tw", value: "tw", flag: "tw", text: "Taiwan (Province of China)" },
    { key: "tj", value: "tj", flag: "tj", text: "Tajikistan" },
    { key: "tz", value: "tz", flag: "tz", text: "Tanzania, United Republic of" },
    { key: "th", value: "th", flag: "th", text: "Thailand" },
    { key: "tl", value: "tl", flag: "tl", text: "Timor-Leste" },
    { key: "tg", value: "tg", flag: "tg", text: "Togo" },
    { key: "tk", value: "tk", flag: "tk", text: "Tokelau" },
    { key: "to", value: "to", flag: "to", text: "Tonga" },
    { key: "tt", value: "tt", flag: "tt", text: "Trinidad and Tobago" },
    { key: "tn", value: "tn", flag: "tn", text: "Tunisia" },
    { key: "tr", value: "tr", flag: "tr", text: "Turkey" },
    { key: "tm", value: "tm", flag: "tm", text: "Turkmenistan" },
    { key: "tc", value: "tc", flag: "tc", text: "Turks and Caicos Islands" },
    { key: "tv", value: "tv", flag: "tv", text: "Tuvalu" },
    { key: "ug", value: "ug", flag: "ug", text: "Uganda" },
    { key: "ua", value: "ua", flag: "ua", text: "Ukraine" },
    { key: "ae", value: "ae", flag: "ae", text: "United Arab Emirates" },
    { key: "um", value: "um", flag: "um", text: "United States Minor Outlying Islands" },
    { key: "us", value: "us", flag: "us", text: "United States of America" },
    { key: "uy", value: "uy", flag: "uy", text: "Uruguay" },
    { key: "uz", value: "uz", flag: "uz", text: "Uzbekistan" },
    { key: "vu", value: "vu", flag: "vu", text: "Vanuatu" },
    { key: "ve", value: "ve", flag: "ve", text: "Venezuela (Bolivarian Republic of)" },
    { key: "vn", value: "vn", flag: "vn", text: "Viet Nam" },
    { key: "vg", value: "vg", flag: "vg", text: "Virgin Islands (British)" },
    { key: "vi", value: "vi", flag: "vi", text: "Virgin Islands (U.S.)" },
    { key: "wf", value: "wf", flag: "wf", text: "Wallis and Futuna" },
    { key: "ye", value: "ye", flag: "ye", text: "Yemen" },
    { key: "zm", value: "zm", flag: "zm", text: "Zambia" },
    { key: "zw", value: "zw", flag: "zw", text: "Zimbabwe" }
  ];

  if (key === "all") {
    return countryOptions;
  }

  return countryOptions.find((co) => {
    return co.key === key;
  });
}

function ScrollToArea(id) {
  var region = document.getElementById(id);
  if (region !== null) {
    console.log(region)
    window.scrollTo(region.offsetLeft, region.offsetTop);
  }
}

function IsShopOwner(token, shopId) {
  var claims = GetClaimsFromToken(token);
  
  var multipleShops = claims.ShopId !== undefined && isArray(claims.ShopId);

  if(multipleShops) {
    var hasClaimToShop = claims.ShopId.find(i => {
      return Number(i) === Number(shopId)
    });

    return hasClaimToShop !== undefined;
  }

  else {
    return claims.ShopId !== undefined &&  Number(claims.ShopId) === Number(shopId)
  }
}

function GoogleAnalyticsEvent(category, action, label, value) {
  ReactGA.initialize('12345');
  ReactGA.event({
    category: category,
    action: action,
    label: label,
    value: value
  });
}

const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000';

const EVM_REVERT = 'VM Exception while processing transaction: revert';

const ether = (n) => {
  return new web3.utils.BN(
    web3.utils.toWei(n.toString(), 'ether')
  )
}

// Same as ether
const tokens = (n) => ether(n);


export {
  ETHER_ADDRESS,
  EVM_REVERT,
  ether,
  tokens,
  ObjectHasEmptyNonBoolProp,
  RetrieveFromGoogleAddress,
  DisplayInfoDialog,
  FancyTitles,
  IsNullOrUndefinedOrEmpty,
  GetClaimsFromToken,
  GetExpiryDateFromFoken,
  GetUrlSegmentItem,
  GetUrlParam,
  PauseWithDimmer,
  GetEnv,
  GetValueFromNestedObject,
  DeepCleanObject,
  ArrayContainsSomeFromAnotherArray,
  ExtractMultiplePropsFromArrayOfObjects,
  ValidateUser,
  ValidateAddress,
  ValidateItem,
  ValidateCoupon,
  ValidateDeliveryOption,
  CountryOptionsFlags,
  ScrollToArea,
  GoogleAnalyticsEvent,
  IsShopOwner,
  LogOut
  // END BootstrapTable
};
