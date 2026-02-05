import {
    SafeAreaView,
    Text,
    View,
    ScrollView,
    Image,
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    Platform,
    TouchableOpacity,
  } from 'react-native';
  import React, {useCallback, useEffect, useRef, useState} from 'react';
  
  import {ScreenStatusBar} from '../../../util/ScreenStatusBar';
  import {COLORS, SIZES} from '../../../util/Theme';
  import {DefaultStyle} from '../../../util/ConstVar';
  import Loader from '../../../util/Loader';
  import AppIcons from '../../../component/AppIcons';
  import {Button, Card} from '@rneui/themed';
  import Api from '../../../service/Api';
  import {
    API_BOOK_APPOINTMENT,
    API_BOOK_APPOINTMENT_VALIDATE,
    API_EXPERT_DETAILS,
    API_GET_STRIPE_CARD_SETUP_KEY,
    API_GET_STRIPE_PUB_KEY,
    API_SCHEDULE_TIMESLOTS_DATE,
    API_SCHEDULE_TIMESLOTS_TIME,
    WEB_URL,
  } from '../../../service/apiEndPoint';
  import {useFocusEffect} from '@react-navigation/native';
  import {log, simpleToast} from '../../../util/Toast';
  import {
    confirmPayment,
    initPaymentSheet,
    presentPaymentSheet,    
    StripeProvider,
  } from '@stripe/stripe-react-native';
  import {useDispatch} from 'react-redux';
  import {showToast} from '../../../redux/toastSlice';
  import IosStatusBar from '../../../component/IosStatusBar';
  
  const SampleProfiles = ({navigation}) => {

    const [selectedTab, setSelectedTab] = useState(0);

    const renderContent = () => {
        switch (selectedTab) {
          case 0:
            return <ProfileOne />;
          case 1:
            return <ProfileTwo />;
          default:
            return <Text style={styles.contentText}></Text>;
        }
      };

    return(
        <>
        <IosStatusBar backgroundColor={COLORS.primary}/>
        <SafeAreaView
        style={[DefaultStyle.flexView, {backgroundColor: COLORS.gray2}]}>
        <ScreenStatusBar
          backgroundColor={COLORS.primary}
          barStyle="dark-content"
        />
        <View style={{flex: 1, backgroundColor: COLORS.white}}>
            
              <View
                style={{
                  backgroundColor: COLORS.white,
                  flexDirection: 'row',
                  alignItems: 'center',
                  height: 52,
                }}>
                <TouchableOpacity
                  style={[styles.ic_back, {padding: 10, position: 'relative', zIndex: 999}]}
                  onPress={() => {
                    console.log("Clicked")
                    navigation.goBack();
                  }}>
                  <AppIcons
                    name={'arrow-back'}
                    type={'MaterialIcons'}
                    size={24}
                    color={COLORS.black}
                  />
                </TouchableOpacity>

                <View style={{position: 'absolute', left:0, right:0, zIndex:100}}>
                  <Text
                    style={{
                      alignSelf: 'center',
                      fontWeight: 'bold',
                      color: COLORS.black,
                      fontSize: 18,
                    }}>
                    Sample Profiles
                  </Text>
                </View>
              </View>

              <View style={styles.tabBar}>
                <TouchableOpacity
                style={[styles.tabButton, selectedTab === 0 && styles.activeTab]}
                onPress={() => setSelectedTab(0)}
                >
                <Text style={[styles.tabLabel, selectedTab === 0 && styles.activeTabText]}>Profile One</Text>
                </TouchableOpacity>
                <TouchableOpacity
                style={[styles.tabButton, selectedTab === 1 && styles.activeTab]}
                onPress={() => setSelectedTab(1)}
                >
                <Text style={[styles.tabLabel, selectedTab === 1 && styles.activeTabText]}>Profile Two</Text>
                </TouchableOpacity>
            </View>

              <View  style={{flex: 1}}>
              <ScrollView
               showsVerticalScrollIndicator={false}>
                
                <View style={{padding:20}}>
                    {renderContent()}
                </View>
                
              </ScrollView> 
                
              </View>
              
            
        </View>
      </SafeAreaView>
        </>
    )

}

const ProfileOne = () => {

    return(
        <View>
            <Text style={[DefaultStyle.blackBold, styles.headings]}>Introduction</Text>
            <Text style={styles.normal}>Hi, I’m Emma Reed, a sophomore at Harvard University, where I’m double majoring in Political Science and Economics. I’m passionate about guiding students through the college admissions process because I know how overwhelming it can be. From my journey of being accepted into multiple Ivy League schools and top liberal arts colleges, I’ve learned the strategies, stories, and systems that can turn your dream school into your reality.</Text>

            <Text style={[DefaultStyle.blackBold, styles.headings, {marginTop:20}]}>What can I help with?</Text>
            
            <View style={{marginLeft: 10, marginTop: 10}}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <AppIcons
                        type={"FontAwesome"}
                        name={"circle"}
                        size={9}
                        color={COLORS.black}
                    />
                    <Text style={[styles.normal, {marginTop: 0, marginLeft: 6, fontWeight: 'bold', fontSize: 14}]}>Crafting a Standout Application:</Text>
                </View>
                <View style={{marginLeft: 18}}>
                    <Text style={styles.normal}>Your application is your chance to tell your unique story, and I can help you make it unforgettable.</Text>
                    <Text style={styles.normal}>- Personal Statements: Together, we’ll create essays that showcase your individuality, values, and vision.</Text>
                    <Text style={styles.normal}>- Supplemental Essays: I’ll help you tailor responses that align with each college’s mission and personality.</Text>
                    <Text style={styles.normal}>- Resume Building: Highlight your achievements and extracurriculars in a way that impresses admissions officers.</Text>
                </View>

                <View style={{flexDirection: 'row', alignItems: 'center', marginTop:20}}>
                    <AppIcons
                        type={"FontAwesome"}
                        name={"circle"}
                        size={9}
                        color={COLORS.black}
                    />
                    <Text style={[styles.normal, {marginTop: 0, marginLeft: 6, fontWeight: 'bold', fontSize: 14}]}>Preparing for Standardized Tests and Academics:</Text>
                </View>
                <View style={{marginLeft: 18}}>
                    <Text style={styles.normal}>Strong academic performance is essential for top-tier colleges, and I’ll guide you in excelling.</Text>
                    <Text style={styles.normal}>- SAT/ACT Strategies: I’ll share techniques for improving scores and making the most of practice tests.</Text>
                    <Text style={styles.normal}>- AP/IB Course Planning: Let’s ensure your coursework reflects both rigor and your passions.</Text>
                    <Text style={styles.normal}>- Time Management: Learn how to balance academics, extracurriculars, and personal growth effectively.</Text>
                </View>

                <View style={{flexDirection: 'row', alignItems: 'center', marginTop:20}}>
                    <AppIcons
                        type={"FontAwesome"}
                        name={"circle"}
                        size={9}
                        color={COLORS.black}
                    />
                    <Text style={[styles.normal, {marginTop: 0, marginLeft: 6, fontWeight: 'bold', fontSize: 14}]}>Navigating the Admissions Process:</Text>
                </View>
                <View style={{marginLeft: 18}}>
                    <Text style={styles.normal}>I’ll simplify the complex college application journey and help you stand out.</Text>
                    <Text style={styles.normal}>- Building a School List: Whether you’re aiming for Ivies, liberal arts colleges, or both, I’ll help identify the best fit for your goals.</Text>
                    <Text style={styles.normal}>- Letters of Recommendation: Tips for fostering relationships with teachers and mentors to secure compelling recommendations.</Text>
                    <Text style={styles.normal}>- Interview Prep: Ace your college interviews with confidence and clarity.</Text>
                </View>

                <View style={{flexDirection: 'row', alignItems: 'center', marginTop:20}}>
                    <AppIcons
                        type={"FontAwesome"}
                        name={"circle"}
                        size={9}
                        color={COLORS.black}
                    />
                    <Text style={[styles.normal, {marginTop: 0, marginLeft: 6, fontWeight: 'bold', fontSize: 14}]}>Insights into College Counselors:</Text>
                </View>
                <View style={{marginLeft: 18}}>
                    <Text style={styles.normal}>Having worked with top college counselors, I can guide you on how to make the most of their expertise:</Text>
                    <Text style={styles.normal}>- Finding the Right Fit: I’ll help you identify counselors who align with your goals and values.</Text>
                    <Text style={styles.normal}>- Making the Most of Sessions: Learn how to prepare, ask the right questions, and get actionable advice.</Text>
                    <Text style={styles.normal}>- Supplementary Guidance: Even if you have a counselor, I can provide additional support for crafting essays, managing timelines, and standing out.</Text>
                </View>

                <View style={{flexDirection: 'row', alignItems: 'center', marginTop:20}}>
                    <AppIcons
                        type={"FontAwesome"}
                        name={"circle"}
                        size={9}
                        color={COLORS.black}
                    />
                    <Text style={[styles.normal, {marginTop: 0, marginLeft: 6, fontWeight: 'bold', fontSize: 14}]}>Harvard Campus Life:</Text>
                </View>
                <View style={{marginLeft: 18}}>
                    <Text style={styles.normal}>As a current Harvard student, I can give you an insider’s view of campus life:</Text>
                    <Text style={styles.normal}>- Navigating Academics: Tips on managing coursework, engaging with professors, and using campus resources like libraries and labs.</Text>
                    <Text style={styles.normal}>- Social Life: From casual hangouts to formal events, I’ll share what makes Harvard’s community unique.</Text>
                    <Text style={styles.normal}>- Clubs and Activities: Whether you’re into art, sports, or activism, I’ll help you explore opportunities that suit your interests.</Text>
                </View>

                <View style={{flexDirection: 'row', alignItems: 'center', marginTop:20}}>
                    <AppIcons
                        type={"FontAwesome"}
                        name={"circle"}
                        size={9}
                        color={COLORS.black}
                    />
                    <Text style={[styles.normal, {marginTop: 0, marginLeft: 6, fontWeight: 'bold', fontSize: 14}]}>Dorm Life and Housing:</Text>
                </View>
                <View style={{marginLeft: 18}}>
                    <Text style={styles.normal}>Living on campus is a huge part of the college experience, and I can guide you through:</Text>
                    <Text style={styles.normal}>- First-Year Dorms: Insights into Harvard’s freshman housing system, including dorm assignments and amenities.</Text>
                    <Text style={styles.normal}>- Roommate Dynamics: Tips on building positive relationships with roommates and setting boundaries.</Text>
                    <Text style={styles.normal}>- House System: An overview of Harvard’s residential houses and how they shape upperclassmen experiences.</Text>
                </View>

                <View style={{flexDirection: 'row', alignItems: 'center', marginTop:20}}>
                    <AppIcons
                        type={"FontAwesome"}
                        name={"circle"}
                        size={9}
                        color={COLORS.black}
                    />
                    <Text style={[styles.normal, {marginTop: 0, marginLeft: 6, fontWeight: 'bold', fontSize: 14}]}>Elite Clubs and Memberships:</Text>
                </View>
                <View style={{marginLeft: 18}}>
                    <Text style={styles.normal}>Joining elite clubs can enhance your college experience and future opportunities:</Text>
                    <Text style={styles.normal}>- Application and Selection Processes: Guidance on applying to prestigious organizations, from debate societies to consulting clubs.</Text>
                    <Text style={styles.normal}>- Networking Opportunities: Learn how to leverage club memberships for internships, mentorships, and career growth.</Text>
                    <Text style={styles.normal}>- Making an Impact: Tips on standing out within these clubs and contributing meaningfully to their missions.</Text>
                </View>

            </View>

        </View>
    )

}

const ProfileTwo = () => {

    return(
        <View>
            <Text style={[DefaultStyle.blackBold, styles.headings]}>Introduction</Text>
            <Text style={styles.normal}>Hi, I’m Ryan Mitchell, a Systems Engineer at SpaceX, where I work on cutting-edge aerospace technologies to advance humanity's presence in space. With experience navigating SpaceX’s competitive hiring process and excelling in its fast-paced work environment, I’m passionate about guiding aspiring engineers, scientists, and dreamers on their journey to joining one of the most innovative companies in the world.</Text>

            <Text style={[DefaultStyle.blackBold, styles.headings, {marginTop:20}]}>What can I help with?</Text>
            
            <View style={{marginLeft: 10, marginTop: 10}}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <AppIcons
                        type={"FontAwesome"}
                        name={"circle"}
                        size={9}
                        color={COLORS.black}
                    />
                    <Text style={[styles.normal, {marginTop: 0, marginLeft: 6, fontWeight: 'bold', fontSize: 14}]}>Cracking the SpaceX Hiring Process:</Text>
                </View>
                <View style={{marginLeft: 18}}>
                    <Text style={styles.normal}>The SpaceX hiring process is rigorous, but with the right preparation, you can stand out. Here’s how I can help:</Text>
                    <Text style={styles.normal}>- Resume Optimization: Tailor your resume to highlight the skills and experiences SpaceX values most.</Text>
                    <Text style={styles.normal}>- Interview Prep: I’ll guide you through technical and behavioral interview questions, with tips on how to showcase problem-solving skills and adaptability.</Text>
                    <Text style={styles.normal}>- Networking: Learn how to connect with SpaceX employees and recruiters to increase your visibility.</Text>
                </View>

                <View style={{flexDirection: 'row', alignItems: 'center', marginTop:20}}>
                    <AppIcons
                        type={"FontAwesome"}
                        name={"circle"}
                        size={9}
                        color={COLORS.black}
                    />
                    <Text style={[styles.normal, {marginTop: 0, marginLeft: 6, fontWeight: 'bold', fontSize: 14}]}>Building the Right Skills and Experience:</Text>
                </View>
                <View style={{marginLeft: 18}}>
                    <Text style={styles.normal}>SpaceX seeks individuals with a passion for innovation and excellence. I’ll help you develop a strong foundation:</Text>
                    <Text style={styles.normal}>- Academic Preparation: Insights into key courses, projects, and internships that align with SpaceX’s needs, including aerospace, mechanical, software, and electrical engineering.</Text>
                    <Text style={styles.normal}>- Technical Skills: Guidance on mastering tools and programming languages like MATLAB, Python, CAD, and C++</Text>
                    <Text style={styles.normal}>- Hands-On Projects: Tips for designing impactful personal or group projects, such as building drones, designing rockets, or working on robotics.</Text>
                </View>

                <View style={{flexDirection: 'row', alignItems: 'center', marginTop:20}}>
                    <AppIcons
                        type={"FontAwesome"}
                        name={"circle"}
                        size={9}
                        color={COLORS.black}
                    />
                    <Text style={[styles.normal, {marginTop: 0, marginLeft: 6, fontWeight: 'bold', fontSize: 14}]}>Navigating SpaceX’s Culture and Expectations:</Text>
                </View>
                <View style={{marginLeft: 18}}>
                    <Text style={styles.normal}>Understanding SpaceX’s mission and work environment is essential for success. Here’s how I can help you prepare:</Text>
                    <Text style={styles.normal}>- Mission Alignment: Learn how to articulate your passion for SpaceX’s goals, such as space exploration and sustainability.</Text>
                    <Text style={styles.normal}>- Work Ethic: Insights into thriving in a high-pressure, results-oriented culture.</Text>
                    <Text style={styles.normal}>- Team Collaboration: Tips on working effectively with multidisciplinary teams to solve complex challenges.</Text>
                </View>

                <View style={{flexDirection: 'row', alignItems: 'center', marginTop:20}}>
                    <AppIcons
                        type={"FontAwesome"}
                        name={"circle"}
                        size={9}
                        color={COLORS.black}
                    />
                    <Text style={[styles.normal, {marginTop: 0, marginLeft: 6, fontWeight: 'bold', fontSize: 14}]}>Insights into SpaceX Roles and Departments:</Text>
                </View>
                <View style={{marginLeft: 18}}>
                    <Text style={styles.normal}>I’ll help you understand the diverse opportunities at SpaceX and identify where you fit best:</Text>
                    <Text style={styles.normal}>- Engineering Roles: Guidance on positions in propulsion, avionics, structures, and integration.</Text>
                    <Text style={styles.normal}>- Non-Engineering Roles: Explore opportunities in supply chain, manufacturing, business operations, and mission control.</Text>
                    <Text style={styles.normal}>- Internships and Entry-Level Jobs: Strategies for breaking into SpaceX as a student or recent graduate.</Text>
                </View>

                <View style={{flexDirection: 'row', alignItems: 'center', marginTop:20}}>
                    <AppIcons
                        type={"FontAwesome"}
                        name={"circle"}
                        size={9}
                        color={COLORS.black}
                    />
                    <Text style={[styles.normal, {marginTop: 0, marginLeft: 6, fontWeight: 'bold', fontSize: 14}]}>Long-Term Career Planning:</Text>
                </View>
                <View style={{marginLeft: 18}}>
                    <Text style={styles.normal}>Landing a role at SpaceX is just the beginning. I can help you build a career that thrives in the aerospace industry:</Text>
                    <Text style={styles.normal}>- Skill Development: Advice on staying at the forefront of emerging technologies.</Text>
                    <Text style={styles.normal}>- Internal Growth: Tips for advancing within SpaceX, including navigating performance reviews and leadership opportunities.</Text>
                    <Text style={styles.normal}>- Exploring the Industry: Guidance on leveraging SpaceX experience to explore roles in other cutting-edge aerospace companies or startups.</Text>
                </View>

            </View>

        </View>
    )

}

const styles = StyleSheet.create({
    headings:{
        color: COLORS.primary
    },
    normal:{
        fontSize: 12,
        marginTop:7,
        color: COLORS.black
    },
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
    tabBar: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      backgroundColor: COLORS.gray2,
      padding:2,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 7,
    },
    tabButton: {
      paddingVertical: 10,
    },
    tabLabel: {
      fontSize: 16,
      color: 'gray',
    },
    activeTab: {
      borderBottomWidth: 3,
      borderBottomColor: COLORS.primary,
    },
    activeTabText: {
      color: COLORS.primary,
      fontWeight: 'bold',
    },
    contentContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    contentText: {
      fontSize: 18,
      color: 'black',
    },
  });

export default SampleProfiles;