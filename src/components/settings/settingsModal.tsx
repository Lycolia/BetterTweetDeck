import './settingsModal.css';

import {isEqual} from 'lodash';
import React, {Fragment, useCallback, useMemo, useState} from 'react';

import {BTDScrollbarsMode} from '../../features/changeScrollbars';
import {BTDTweetActionsPosition} from '../../features/changeTweetActions';
import {Renderer} from '../../helpers/typeHelpers';
import {OnSettingsUpdate} from '../../inject/setupSettings';
import {AbstractTweetDeckSettings} from '../../types/abstractTweetDeckSettings';
import {BTDSettings} from '../../types/betterTweetDeck/btdSettingsTypes';
import {AvatarsShape} from './components/avatarsShape';
import {BooleanSettingsRow} from './components/booleanSettingRow';
import {CheckboxSelectSettingsRow} from './components/checkboxSelectSettingsRow';
import {CustomAccentColor} from './components/customAccentColor';
import {
  BTDRadioSelectSettingsRow,
  TDRadioSelectSettingsRow,
} from './components/radioSelectSettingsRow';
import {SettingsSeperator} from './components/settingsSeperator';
import {ThemeSelector} from './components/themeSelector';
import {BetterTweetDeckDarkThemes} from '../../features/themeTweaks';
import {BTDTimestampFormats} from '../../features/changeTimestampFormat';

import {settingsDisabled, settingsRow, settingsRowTitle} from './settingsStyles';
import {css, cx} from '@emotion/css';
import {DateTime} from 'luxon';
import {SettingsTimeFormatInput} from './components/settingsTimeFormatInput';
import {BTDUsernameFormat} from '../../features/usernameDisplay';
import {SettingsTextInput} from './components/settingsTextInput';
import {SettingsButton} from './components/settingsButton';

interface SettingsModalProps {
  btdSettings: BTDSettings;
  tdSettings: AbstractTweetDeckSettings;
  onSettingsUpdate: OnSettingsUpdate;
}

interface MenuItem {
  id: string;
  label: string;
  render: Renderer;
}

export const SettingsModal = (props: SettingsModalProps) => {
  const {onSettingsUpdate} = props;
  const [btdSettings, setBtdSettings] = useState<BTDSettings>(props.btdSettings);
  const [tdSettings, setTdSettings] = useState<AbstractTweetDeckSettings>(props.tdSettings);
  const [isDirty, setIsDirty] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const makeOnSettingsChange = <T extends keyof BTDSettings>(key: T) => {
    return (val: BTDSettings[T]) => {
      setBtdSettings((currentSettings) => {
        return {
          ...currentSettings,
          [key]: val,
        };
      });
      setIsDirty(true);
    };
  };

  const makeOnTdSettingsChange = <T extends keyof AbstractTweetDeckSettings>(key: T) => {
    return (val: AbstractTweetDeckSettings[T]) => {
      setTdSettings((currentSettings) => {
        return {
          ...currentSettings,
          [key]: val,
        };
      });
      setIsDirty(true);
    };
  };

  const updateSettings = useCallback(() => {
    onSettingsUpdate(btdSettings, tdSettings);
    setIsDirty(false);
  }, [onSettingsUpdate, btdSettings, tdSettings]);

  const canSave = useMemo(() => isDirty, [isDirty]);

  const reloadNeeded = useMemo(() => !isEqual(props.btdSettings, btdSettings) && isDirty, [
    btdSettings,
    isDirty,
    props.btdSettings,
  ]);

  const menu: readonly MenuItem[] = [
    {
      id: 'general',
      label: 'General',
      render: () => {
        return (
          <Fragment>
            <BooleanSettingsRow
              settingsKey="useStream"
              initialValue={tdSettings.useStream}
              alignToTheLeft
              onChange={makeOnTdSettingsChange('useStream')}>
              Stream Tweets in realtime
            </BooleanSettingsRow>
            <BooleanSettingsRow
              settingsKey="showStartupNotifications"
              initialValue={tdSettings.showStartupNotifications}
              alignToTheLeft
              onChange={makeOnTdSettingsChange('showStartupNotifications')}>
              Show notifications on startup
            </BooleanSettingsRow>
            <BooleanSettingsRow
              settingsKey="displaySensitiveMedia"
              initialValue={tdSettings.displaySensitiveMedia}
              alignToTheLeft
              onChange={makeOnTdSettingsChange('displaySensitiveMedia')}>
              Display media that may contain sensitive content
            </BooleanSettingsRow>
            <BooleanSettingsRow
              settingsKey="autoplayGifs"
              initialValue={tdSettings.autoPlayGifs}
              alignToTheLeft
              onChange={makeOnTdSettingsChange('autoPlayGifs')}>
              Autoplay GIFs
            </BooleanSettingsRow>
            <BooleanSettingsRow
              settingsKey="badgesOnTopOfAvatars"
              initialValue={btdSettings.badgesOnTopOfAvatars}
              alignToTheLeft
              onChange={makeOnSettingsChange('badgesOnTopOfAvatars')}>
              Show badges on top of avatars
            </BooleanSettingsRow>
            <BooleanSettingsRow
              settingsKey="collapseReadDms"
              initialValue={btdSettings.collapseReadDms}
              alignToTheLeft
              onChange={makeOnSettingsChange('collapseReadDms')}>
              Collapse read DMs
            </BooleanSettingsRow>
            <BooleanSettingsRow
              settingsKey="disableGifsInProfilePictures"
              initialValue={btdSettings.disableGifsInProfilePictures}
              alignToTheLeft
              onChange={makeOnSettingsChange('disableGifsInProfilePictures')}>
              Freeze GIFs in profile pictures
            </BooleanSettingsRow>
            <BooleanSettingsRow
              settingsKey="removeRedirectionOnLinks"
              initialValue={btdSettings.removeRedirectionOnLinks}
              alignToTheLeft
              onChange={makeOnSettingsChange('removeRedirectionOnLinks')}>
              Remove t.co redirection on links
            </BooleanSettingsRow>
            <BooleanSettingsRow
              settingsKey="smallComposerButtons"
              initialValue={btdSettings.smallComposerButtons}
              alignToTheLeft
              onChange={makeOnSettingsChange('smallComposerButtons')}>
              Make buttons smaller in the composer
            </BooleanSettingsRow>
            <BooleanSettingsRow
              settingsKey="updateTabTitleOnActivity"
              initialValue={btdSettings.updateTabTitleOnActivity}
              alignToTheLeft
              onChange={makeOnSettingsChange('updateTabTitleOnActivity')}>
              Reflect new tweets and DMs in the tab's title
            </BooleanSettingsRow>
          </Fragment>
        );
      },
    },
    {
      id: 'theme-tweaks',
      label: 'Theme',
      render: () => {
        return (
          <Fragment>
            <CustomAccentColor
              initialValue={btdSettings.customAccentColor}
              onChange={makeOnSettingsChange('customAccentColor')}></CustomAccentColor>
            <ThemeSelector
              initialValue={
                tdSettings.theme === 'dark' ? btdSettings.customDarkTheme : tdSettings.theme
              }
              onChange={(value) => {
                if (value === 'light') {
                  makeOnTdSettingsChange('theme')(value);
                  makeOnSettingsChange('customDarkTheme')(BetterTweetDeckDarkThemes.DEFAULT);
                } else {
                  makeOnTdSettingsChange('theme')('dark');
                  makeOnSettingsChange('customDarkTheme')(value);
                }
              }}></ThemeSelector>
            <CheckboxSelectSettingsRow
              onChange={(_key, value) => {
                makeOnSettingsChange('enableAutoThemeSwitch')(value);
              }}
              disabled={tdSettings.theme === 'light'}
              fields={[
                {
                  initialValue: btdSettings.enableAutoThemeSwitch,
                  key: 'enableAutoThemeSwitch',
                  label: 'Switch to light theme when OS is in light mode',
                },
              ]}></CheckboxSelectSettingsRow>
            <AvatarsShape
              initialValue={btdSettings.avatarsShape}
              onChange={makeOnSettingsChange('avatarsShape')}></AvatarsShape>
            <BTDRadioSelectSettingsRow
              settingsKey="scrollbarsMode"
              initialValue={btdSettings.scrollbarsMode}
              onChange={makeOnSettingsChange('scrollbarsMode')}
              fields={[
                {label: 'Default', value: BTDScrollbarsMode.DEFAULT},
                {label: 'Thin', value: BTDScrollbarsMode.SLIM},
                {label: 'Hidden', value: BTDScrollbarsMode.HIDDEN},
              ]}>
              Style of scrollbars
            </BTDRadioSelectSettingsRow>
            <TDRadioSelectSettingsRow
              settingsKey="fontSize"
              initialValue={tdSettings.fontSize}
              onChange={makeOnTdSettingsChange('fontSize')}
              fields={[
                {label: 'Smallest', value: 'smallest'},
                {label: 'Small', value: 'small'},
                {label: 'Medium', value: 'medium'},
                {label: 'Large', value: 'large'},
                {label: 'Largest', value: 'largest'},
              ]}>
              Font size
            </TDRadioSelectSettingsRow>
          </Fragment>
        );
      },
    },
    {
      id: 'columns',
      label: 'Columns',
      render: () => {
        return (
          <Fragment>
            <BooleanSettingsRow
              alignToTheLeft
              settingsKey="hideColumnIcons"
              initialValue={btdSettings.hideColumnIcons}
              onChange={makeOnSettingsChange('hideColumnIcons')}>
              Hide icons on top of columns
            </BooleanSettingsRow>
            <BooleanSettingsRow
              alignToTheLeft
              settingsKey="showClearButtonInColumnsHeader"
              initialValue={btdSettings.showClearButtonInColumnsHeader}
              onChange={makeOnSettingsChange('showClearButtonInColumnsHeader')}>
              Show &quot;Clear&quot; button in columns&apos; header
            </BooleanSettingsRow>
            <BooleanSettingsRow
              alignToTheLeft
              settingsKey="showCollapseButtonInColumnsHeader"
              initialValue={btdSettings.showCollapseButtonInColumnsHeader}
              onChange={makeOnSettingsChange('showCollapseButtonInColumnsHeader')}>
              Show &quot;Collapse&quot; button in columns&apos; header
            </BooleanSettingsRow>
            <SettingsSeperator></SettingsSeperator>
            <TDRadioSelectSettingsRow
              settingsKey="columnWidth"
              initialValue={tdSettings.columnWidth}
              onChange={makeOnTdSettingsChange('columnWidth')}
              fields={[
                {label: 'Narrow', value: 'narrow'},
                {label: 'Medium', value: 'medium'},
                {label: 'Wide', value: 'wide'},
              ]}>
              Column width
            </TDRadioSelectSettingsRow>
          </Fragment>
        );
      },
    },
    {
      id: 'tweets-display',
      label: 'Tweets display',
      render: () => {
        return (
          <Fragment>
            <BooleanSettingsRow
              alignToTheLeft
              settingsKey="showLegacyReplies"
              initialValue={btdSettings.showLegacyReplies}
              onChange={makeOnSettingsChange('showLegacyReplies')}>
              Use old style of replies (inline @mentions)
            </BooleanSettingsRow>
            <SettingsSeperator></SettingsSeperator>
            <BTDRadioSelectSettingsRow
              settingsKey="timestampStyle"
              initialValue={btdSettings.timestampStyle}
              onChange={makeOnSettingsChange('timestampStyle')}
              fields={[
                {label: 'Relative', value: BTDTimestampFormats.RELATIVE},
                {label: 'Custom', value: BTDTimestampFormats.CUSTOM},
              ]}>
              Date format
            </BTDRadioSelectSettingsRow>
            <div
              className={cx(
                settingsRow,
                btdSettings.timestampStyle === BTDTimestampFormats.RELATIVE && settingsDisabled
              )}>
              <span></span>
              <SettingsTimeFormatInput
                value={btdSettings.timestampShortFormat}
                onChange={makeOnSettingsChange('timestampShortFormat')}
                preview={formatDateTime(
                  btdSettings.timestampShortFormat
                )}></SettingsTimeFormatInput>
            </div>
            <BooleanSettingsRow
              alignToTheLeft
              settingsKey="fullTimestampAfterDay"
              initialValue={btdSettings.fullTimestampAfterDay}
              onChange={makeOnSettingsChange('fullTimestampAfterDay')}>
              Use a different date format after 24h
            </BooleanSettingsRow>
            <div
              className={cx(
                settingsRow,
                (btdSettings.timestampStyle === BTDTimestampFormats.RELATIVE ||
                  !btdSettings.fullTimestampAfterDay) &&
                  settingsDisabled
              )}>
              <span></span>
              <SettingsTimeFormatInput
                value={btdSettings.timestampFullFormat}
                onChange={makeOnSettingsChange('timestampFullFormat')}
                preview={formatDateTime(btdSettings.timestampFullFormat)}></SettingsTimeFormatInput>
            </div>
            <div
              className={cx(
                settingsRow,
                css`
                  align-items: flex-start;
                `
              )}>
              <span className={settingsRowTitle}>Presets</span>
              <div
                className={css`
                  display: inline-block;
                  margin-left: -10px;

                  > button {
                    margin-bottom: 10px;
                    margin-left: 10px;
                  }
                `}>
                <SettingsButton
                  onClick={() => {
                    makeOnSettingsChange('timestampStyle')(BTDTimestampFormats.CUSTOM);
                    makeOnSettingsChange('fullTimestampAfterDay')(true);
                    makeOnSettingsChange('timestampShortFormat')('HH:mm');
                    makeOnSettingsChange('timestampFullFormat')('dd/MM/yy HH:mm');
                  }}>
                  Absolute
                </SettingsButton>
                <SettingsButton
                  onClick={() => {
                    makeOnSettingsChange('timestampStyle')(BTDTimestampFormats.CUSTOM);
                    makeOnSettingsChange('fullTimestampAfterDay')(true);
                    makeOnSettingsChange('timestampShortFormat')('hh:mm');
                    makeOnSettingsChange('timestampFullFormat')('MM/dd/yy hh:mm');
                  }}>
                  Absolute (U.S. style)
                </SettingsButton>
              </div>
            </div>
            <SettingsSeperator></SettingsSeperator>
            <BTDRadioSelectSettingsRow
              settingsKey="usernamesFormat"
              initialValue={btdSettings.usernamesFormat}
              onChange={makeOnSettingsChange('usernamesFormat')}
              fields={[
                {label: 'Fullname @username', value: BTDUsernameFormat.DEFAULT},
                {label: '@username fullname', value: BTDUsernameFormat.USER_FULL},
                {label: '@username', value: BTDUsernameFormat.USER},
                {label: 'Fullname', value: BTDUsernameFormat.FULL},
              ]}>
              Name display style
            </BTDRadioSelectSettingsRow>
          </Fragment>
        );
      },
    },
    {
      id: 'tweet-actions',
      label: 'Tweet actions',
      render: () => {
        return (
          <Fragment>
            <BTDRadioSelectSettingsRow
              settingsKey="showTweetActionsOnHover"
              initialValue={btdSettings.showTweetActionsOnHover}
              onChange={makeOnSettingsChange('showTweetActionsOnHover')}
              fields={[
                {label: 'Always', value: false},
                {label: 'On hover', value: true},
              ]}>
              Actions visibility
            </BTDRadioSelectSettingsRow>
            <BTDRadioSelectSettingsRow
              settingsKey="tweetActionsPosition"
              initialValue={btdSettings.tweetActionsPosition}
              onChange={makeOnSettingsChange('tweetActionsPosition')}
              fields={[
                {label: 'Left', value: BTDTweetActionsPosition.LEFT},
                {label: 'Right', value: BTDTweetActionsPosition.RIGHT},
              ]}>
              Position of actions
            </BTDRadioSelectSettingsRow>
            <CheckboxSelectSettingsRow
              onChange={(key, value) => {
                makeOnSettingsChange('tweetActions')({
                  ...btdSettings.tweetActions,
                  [key]: value,
                });
              }}
              fields={[
                {
                  initialValue: btdSettings.tweetActions.addBlockAction,
                  key: 'addBlockAction',
                  label: 'Block author',
                },
                {
                  initialValue: btdSettings.tweetActions.addMuteAction,
                  key: 'addMuteAction',
                  label: 'Mute author',
                },
                {
                  initialValue: btdSettings.tweetActions.addCopyMediaLinksAction,
                  key: 'addCopyMediaLinksAction',
                  label: 'Copy media links',
                },
                {
                  initialValue: btdSettings.tweetActions.addDownloadMediaLinksAction,
                  key: 'addDownloadMediaLinksAction',
                  label: 'Download media',
                },
              ]}>
              Additional actions
            </CheckboxSelectSettingsRow>
            <div
              className={cx(
                settingsRow,
                !btdSettings.tweetActions.addDownloadMediaLinksAction && settingsDisabled,
                css`
                  grid-template-columns: 150px 1fr;

                  input {
                    width: 80%;
                  }
                `
              )}>
              <span className={settingsRowTitle}>Downloaded filename format</span>
              <SettingsTextInput
                value={btdSettings.downloadFilenameFormat}
                onChange={makeOnSettingsChange('downloadFilenameFormat')}></SettingsTextInput>
            </div>
            <div
              className={cx(
                settingsRow,
                !btdSettings.tweetActions.addDownloadMediaLinksAction && settingsDisabled,
                css`
                  align-items: flex-start;
                `
              )}>
              <span className={settingsRowTitle}>Filename format tokens</span>
              <div
                className={css`
                  display: inline-block;
                  margin-left: -10px;

                  > button {
                    margin-bottom: 10px;
                    margin-left: 10px;
                  }
                `}>
                <SettingsButton
                  onClick={() => {
                    makeOnSettingsChange('downloadFilenameFormat')(
                      btdSettings.downloadFilenameFormat + '{{postedUser}}'
                    );
                  }}>
                  username (without @)
                </SettingsButton>
                <SettingsButton
                  onClick={() => {
                    makeOnSettingsChange('downloadFilenameFormat')(
                      btdSettings.downloadFilenameFormat + '{{tweetId}}'
                    );
                  }}>
                  Tweet ID
                </SettingsButton>
                <SettingsButton
                  onClick={() => {
                    makeOnSettingsChange('downloadFilenameFormat')(
                      btdSettings.downloadFilenameFormat + '{{fileName}}'
                    );
                  }}>
                  Filename
                </SettingsButton>
                <SettingsButton
                  onClick={() => {
                    makeOnSettingsChange('downloadFilenameFormat')(
                      btdSettings.downloadFilenameFormat + '{{fileExtension}}'
                    );
                  }}>
                  File extension
                </SettingsButton>
                <SettingsButton
                  onClick={() => {
                    makeOnSettingsChange('downloadFilenameFormat')(
                      btdSettings.downloadFilenameFormat + '{{year}}'
                    );
                  }}>
                  Year ({formatDateTime('yyyy')})
                </SettingsButton>
                <SettingsButton
                  onClick={() => {
                    makeOnSettingsChange('downloadFilenameFormat')(
                      btdSettings.downloadFilenameFormat + '{{day}}'
                    );
                  }}>
                  Day ({formatDateTime('dd')})
                </SettingsButton>
                <SettingsButton
                  onClick={() => {
                    makeOnSettingsChange('downloadFilenameFormat')(
                      btdSettings.downloadFilenameFormat + '{{month}}'
                    );
                  }}>
                  Month ({formatDateTime('MM')})
                </SettingsButton>
                <SettingsButton
                  onClick={() => {
                    makeOnSettingsChange('downloadFilenameFormat')(
                      btdSettings.downloadFilenameFormat + '{{minutes}}'
                    );
                  }}>
                  Minutes
                </SettingsButton>
                <SettingsButton
                  onClick={() => {
                    makeOnSettingsChange('downloadFilenameFormat')(
                      btdSettings.downloadFilenameFormat + '{{seconds}}'
                    );
                  }}>
                  Seconds
                </SettingsButton>
              </div>
            </div>
            <CheckboxSelectSettingsRow
              onChange={(key, value) => {
                makeOnSettingsChange('tweetMenuItems')({
                  ...btdSettings.tweetMenuItems,
                  [key]: value,
                });
              }}
              fields={[
                {
                  initialValue: btdSettings.tweetMenuItems.addMuteHashtagsMenuItems,
                  key: 'addMuteHashtagsMenuItems',
                  label: 'Mute #hashtags',
                },
                {
                  initialValue: btdSettings.tweetMenuItems.addMuteSourceMenuItem,
                  key: 'addMuteSourceMenuItem',
                  label: "Mute tweet's source",
                },
                {
                  initialValue: btdSettings.tweetMenuItems.addRedraftMenuItem,
                  key: 'addRedraftMenuItem',
                  label: 'Re-draft',
                },
              ]}>
              Additional tweet menu items
            </CheckboxSelectSettingsRow>
            <SettingsSeperator></SettingsSeperator>
            <BooleanSettingsRow
              settingsKey="replaceHeartsByStars"
              initialValue={btdSettings.replaceHeartsByStars}
              onChange={makeOnSettingsChange('replaceHeartsByStars')}>
              Replace hearts by stars
            </BooleanSettingsRow>
          </Fragment>
        );
      },
    },
  ];

  return (
    <div className="btd-settings-modal">
      <header className="btd-settings-header">Settings</header>
      <aside className="btd-settings-sidebar">
        <ul>
          {menu.map((item, index) => {
            return (
              <li
                key={item.id}
                className={(selectedIndex === index && 'active') || ''}
                onClick={() => {
                  setSelectedIndex(index);
                }}>
                <div className="text">{item.label}</div>
              </li>
            );
          })}
        </ul>
      </aside>
      <section className="btd-settings-content">{menu[selectedIndex].render()}</section>
      <footer className="btd-settings-footer">
        <div>
          {reloadNeeded && <span className="btd-settings-footer-label">TweetDeck will reload</span>}
          <SettingsButton variant="primary" onClick={updateSettings} disabled={!canSave}>
            Save
          </SettingsButton>
        </div>
      </footer>
    </div>
  );
};

function formatDateTime(format: string) {
  return DateTime.local().toFormat(format);
}
